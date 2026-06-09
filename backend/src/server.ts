import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { ScoringEngine } from './domain/scoringEngine';
import { NeedsAnalyzer } from './domain/needsAnalyzer';
import { ProcessScoringUseCase } from './application/processScoringUseCase';
import { DetectNeedsUseCase } from './application/detectNeedsUseCase';
import { MockEventPublisher } from './infrastructure/mockEventPublisher';
import { ScoringMatrix } from './domain/contracts';

const app = express();
app.use(cors());
app.use(express.json());

// --- Configuración compartida ---
const publisher = new MockEventPublisher();
const matrizPiloto: ScoringMatrix = {
  version: 'v2.0-piloto',
  mapeos: [
    { preguntaId: 'q1', competenciaId: 'Comunicacion', peso: 1 },
    { preguntaId: 'q2', competenciaId: 'Liderazgo', peso: 1 },
    { preguntaId: 'q3', competenciaId: 'Innovacion', peso: 1 },
    { preguntaId: 'q4', competenciaId: 'Comunicacion', peso: 1 },
    { preguntaId: 'q5', competenciaId: 'Liderazgo', peso: 1 },
  ],
  perfilesEsperados: {
    'tech-lead': [
      { competenciaId: 'Comunicacion', scoreMinimoEsperado: 4 },
      { competenciaId: 'Liderazgo', scoreMinimoEsperado: 4.5 },
      { competenciaId: 'Innovacion', scoreMinimoEsperado: 3.5 },
    ],
    'manager-it': [
      { competenciaId: 'Comunicacion', scoreMinimoEsperado: 4.5 },
      { competenciaId: 'Liderazgo', scoreMinimoEsperado: 4 },
      { competenciaId: 'Innovacion', scoreMinimoEsperado: 3 },
    ],
    'developer': [
      { competenciaId: 'Comunicacion', scoreMinimoEsperado: 3 },
      { competenciaId: 'Liderazgo', scoreMinimoEsperado: 2.5 },
      { competenciaId: 'Innovacion', scoreMinimoEsperado: 4 },
    ],
  }
};

const scoringUseCase = new ProcessScoringUseCase(new ScoringEngine(), publisher, matrizPiloto);
const needsUseCase = new DetectNeedsUseCase(new NeedsAnalyzer(), publisher, matrizPiloto);

// Inicializar cliente OpenAI (usa OPENAI_API_KEY del entorno)
const openai = new OpenAI();

// --- Rutas ---

/**
 * POST /api/diagnostico
 * Recibe respuestas del cuestionario, calcula scores y detecta necesidades.
 */
app.post('/api/diagnostico', async (req, res) => {
  try {
    const { userId, roleId, respuestas } = req.body;
    const executionId = `exec-${Date.now()}`;

    const scoreEvent = await scoringUseCase.execute({ executionId, userId, roleId, respuestas });
    const necesidadEvent = await needsUseCase.execute(scoreEvent);

    res.json({ scoreEvent, necesidadEvent });
  } catch (error) {
    console.error('[POST /api/diagnostico]', error);
    res.status(500).json({ error: 'Error al procesar el diagnóstico.' });
  }
});

/**
 * POST /api/agent/chat
 * Recibe el historial de conversación y devuelve la respuesta del agente LLM.
 */
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { userId, roleId, necesidades, history, userMessage } = req.body;
    const isInit = userMessage === '__INIT__';

    const systemPrompt = `Eres un mentor y coach de carrera empático del Grupo Vázquez.
Tu objetivo es ayudar al colaborador a cerrar sus brechas de competencias de forma constructiva.
Usa un tono cercano, como un mentor en tecnología para alguien no técnico. Usa metáforas claras.
El colaborador tiene el rol de "${roleId}".
Sus principales áreas de desarrollo son: ${necesidades.map((n: any) => `${n.competenciaId} (brecha: ${n.brecha}, prioridad: ${n.prioridad})`).join(', ')}.
Responde siempre en español. Sé conciso (máximo 3 párrafos por respuesta).`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    if (isInit) {
      const topNeed = necesidades[0];
      if (topNeed) {
        messages.push({
          role: 'user',
          content: `Genera un saludo inicial empático para ${userId}. Menciona que trabajarán en "${topNeed.competenciaId}" y haz una pregunta abierta para iniciar la conversación.`
        });
      } else {
        messages.push({ role: 'user', content: `Genera un saludo inicial felicitando a ${userId} porque su perfil supera las expectativas del rol.` });
      }
    } else {
      messages.push({ role: 'user', content: userMessage });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? 'Disculpa, no pude generar una respuesta.';
    res.json({ reply });
  } catch (error) {
    console.error('[POST /api/agent/chat]', error);
    res.status(500).json({ error: 'Error al contactar al agente.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`[Server] Backend API corriendo en http://localhost:${PORT}`);
});
