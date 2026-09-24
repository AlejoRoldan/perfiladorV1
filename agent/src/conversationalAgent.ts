import 'dotenv/config';
import OpenAI from 'openai';

export interface Necesidad {
  competenciaId: string;
  scoreActual: number;
  scoreEsperado: number;
  brecha: number;
  prioridad: string;
}

export interface AgentInput {
  userId: string;
  roleId: string;
  necesidades: Necesidad[];
}

const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';

/**
 * Agente Conversacional (LLM).
 * Responsabilidad: generar un mensaje inicial empático y accionable basado en necesidades detectadas.
 */
export class ConversationalAgent {
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL) {
    this.openai = new OpenAI({
      apiKey,
      ...(process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : {}),
    });
    this.model = model;
  }

  public async generateInitialGreeting(input: AgentInput): Promise<string> {
    if (input.necesidades.length === 0) {
      return `¡Hola! He revisado tu perfil para el rol de ${input.roleId} y estás exactamente donde necesitamos que estés. ¡Excelente trabajo!`;
    }

    const necesidadPrincipal = input.necesidades[0];

    if (!necesidadPrincipal) {
      throw new Error('No se encontró una necesidad principal para generar el saludo.');
    }

    const systemPrompt = `Eres un mentor y coach de carrera empático y profesional del Grupo Vázquez.
Tu objetivo es ayudar a los colaboradores a cerrar sus brechas de competencias de forma constructiva y motivadora.
No uses un tono robótico. Usa un tono cercano, como un mentor en tecnología para alguien no técnico. Usa metáforas claras solo si ayudan a comprender.`;

    const userPrompt = `El colaborador tiene el rol de ${input.roleId}.
Tras su evaluación, detectamos que su mayor área de mejora (brecha de ${necesidadPrincipal.brecha} puntos) es en la competencia: "${necesidadPrincipal.competenciaId}".
Su score actual es ${necesidadPrincipal.scoreActual}, pero se espera un ${necesidadPrincipal.scoreEsperado}.

Genera un mensaje inicial corto (máximo tres párrafos) saludando al colaborador, reconociendo el resultado de forma positiva, mencionando específicamente que trabajarán juntos en "${necesidadPrincipal.competenciaId}", y haciendo una pregunta abierta para iniciar la conversación sobre cómo le gustaría empezar a mejorar en esa área.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      });

      return response.choices[0]?.message.content?.trim()
        || 'Hola, ¿cómo estás? Estoy aquí para ayudarte a desarrollar tus habilidades.';
    } catch (error) {
      console.error('[ConversationalAgent] Error calling LLM:', error instanceof Error ? error.message : error);
      throw new Error('No se pudo generar el saludo inicial del agente.');
    }
  }
}
