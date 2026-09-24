import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { ScoringEngine } from './domain/scoringEngine';
import { NeedsAnalyzer } from './domain/needsAnalyzer';
import { ProcessScoringUseCase } from './application/processScoringUseCase';
import { DetectNeedsUseCase } from './application/detectNeedsUseCase';
import { MockEventPublisher } from './infrastructure/mockEventPublisher';
import { ScoringMatrix } from './domain/contracts';
import { loadRuntimeConfig } from './config';
import { chatRequestSchema, diagnosticoRequestSchema } from './presentation/http/requestSchemas';

const app = express();
app.use(cors());
app.use(express.json({ limit: '32kb' }));

const runtimeConfig = loadRuntimeConfig();
const openai = runtimeConfig.openAiApiKey
  ? new OpenAI({
      apiKey: runtimeConfig.openAiApiKey,
      ...(runtimeConfig.openAiBaseUrl ? { baseURL: runtimeConfig.openAiBaseUrl } : {}),
    })
  : null;

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
    developer: [
      { competenciaId: 'Comunicacion', scoreMinimoEsperado: 3 },
      { competenciaId: 'Liderazgo', scoreMinimoEsperado: 2.5 },
      { competenciaId: 'Innovacion', scoreMinimoEsperado: 4 },
    ],
  },
};

const scoringUseCase = new ProcessScoringUseCase(new ScoringEngine(), publisher, matrizPiloto);
const needsUseCase = new DetectNeedsUseCase(new NeedsAnalyzer(), publisher, matrizPiloto);

function validationErrorResponse(issues: Array<{ path: PropertyKey[]; message: string }>) {
  return {
    error: 'La solicitud contiene datos no válidos.',
    details: issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  };
}

// --- Rutas ---

/** Indica si la API está disponible y si el chat tiene credenciales configuradas. */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    agentConfigured: Boolean(openai),
  });
});

/**
 * POST /api/diagnostico
 * Recibe respuestas validadas del cuestionario, calcula scores y detecta necesidades.
 */
app.post('/api/diagnostico', async (req, res) => {
  const parsedRequest = diagnosticoRequestSchema.safeParse(req.body);

  if (!parsedRequest.success) {
    return res.status(400).json(validationErrorResponse(parsedRequest.error.issues));
  }

  try {
    const { userId, roleId, respuestas } = parsedRequest.data;
    const executionId = `exec-${Date.now()}`;
    const scoreEvent = await scoringUseCase.execute({ executionId, userId, roleId, respuestas });
    const necesidadEvent = await needsUseCase.execute(scoreEvent);

    return res.json({ scoreEvent, necesidadEvent });
  } catch (error) {
    console.error('[POST /api/diagnostico]', error instanceof Error ? error.message : error);
    return res.status(500).json({ error: 'No fue posible procesar el diagnóstico.' });
  }
});

/**
 * POST /api/agent/chat
 * Recibe un historial acotado y devuelve la respuesta del agente LLM.
 */
app.post('/api/agent/chat', async (req, res) => {
  const parsedRequest = chatRequestSchema.safeParse(req.body);

  if (!parsedRequest.success) {
    return res.status(400).json(validationErrorResponse(parsedRequest.error.issues));
  }

  if (!openai) {
    return res.status(503).json({
      error: 'El agente no está configurado. Agrega OPENAI_API_KEY en backend/.env y reinicia el backend.',
    });
  }

  try {
    const { userId, roleId, necesidades, history, userMessage } = parsedRequest.data;
    const isInit = userMessage === '__INIT__';
    const developmentAreas = necesidades.length > 0
      ? necesidades.map((need) => `${need.competenciaId} (brecha: ${need.brecha}, prioridad: ${need.prioridad})`).join(', ')
      : 'No se detectaron brechas prioritarias.';

    const systemPrompt = `Eres un mentor y coach de carrera empático del Grupo Vázquez.
Tu objetivo es ayudar al colaborador a cerrar sus brechas de competencias de forma constructiva.
Usa un tono cercano, como un mentor en tecnología para alguien no técnico. Usa metáforas claras solo cuando ayuden a comprender.
El colaborador tiene el rol de "${roleId}".
Sus principales áreas de desarrollo son: ${developmentAreas}.
Responde siempre en español. Sé conciso: máximo tres párrafos por respuesta.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((message) => ({ role: message.role, content: message.content })),
    ];

    if (isInit) {
      const topNeed = necesidades[0];
      messages.push({
        role: 'user',
        content: topNeed
          ? `Genera un saludo inicial empático para ${userId}. Menciona que trabajarán en "${topNeed.competenciaId}" y haz una pregunta abierta para iniciar la conversación.`
          : `Genera un saludo inicial felicitando a ${userId} porque su perfil supera las expectativas del rol. Haz una pregunta abierta sobre su siguiente objetivo de desarrollo.`,
      });
    } else {
      messages.push({ role: 'user', content: userMessage });
    }

    const completion = await openai.chat.completions.create({
      model: runtimeConfig.openAiModel,
      messages,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim()
      || 'Disculpa, no pude generar una respuesta en este momento.';
    return res.json({ reply });
  } catch (error) {
    console.error('[POST /api/agent/chat]', error instanceof Error ? error.message : error);
    return res.status(502).json({ error: 'No fue posible obtener una respuesta del agente. Intenta nuevamente.' });
  }
});

app.listen(runtimeConfig.port, () => {
  console.log(`[Server] Backend API corriendo en http://localhost:${runtimeConfig.port}`);
});
