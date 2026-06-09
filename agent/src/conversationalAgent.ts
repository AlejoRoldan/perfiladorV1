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

/**
 * Agente Conversacional (LLM)
 * Responsabilidad: Generar un mensaje inicial empático y accionable basado en las necesidades detectadas.
 */
export class ConversationalAgent {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    // Si no se pasa apiKey, OpenAI intentará leer process.env.OPENAI_API_KEY
    this.openai = new OpenAI({ apiKey });
  }

  public async generateInitialGreeting(input: AgentInput): Promise<string> {
    if (input.necesidades.length === 0) {
      return `¡Hola! He revisado tu perfil para el rol de ${input.roleId} y estás exactamente donde necesitamos que estés. ¡Excelente trabajo!`;
    }

    // Tomamos la necesidad de mayor prioridad (la primera, asumiendo que vienen ordenadas)
    const necesidadPrincipal = input.necesidades[0];

    const systemPrompt = `Eres un mentor y coach de carrera empático y profesional del Grupo Vázquez.
Tu objetivo es ayudar a los colaboradores a cerrar sus brechas de competencias de forma constructiva y motivadora.
No uses un tono robótico. Usa un tono cercano, como un mentor en tecnología para alguien no Tech. Usa metáforas claras si es necesario.`;

    const userPrompt = `El colaborador tiene el rol de ${input.roleId}.
Tras su evaluación, detectamos que su mayor área de mejora (brecha de ${necesidadPrincipal.brecha} puntos) es en la competencia: "${necesidadPrincipal.competenciaId}".
Su score actual es ${necesidadPrincipal.scoreActual}, pero se espera un ${necesidadPrincipal.scoreEsperado}.

Genera un mensaje inicial corto (máximo 3 párrafos) saludando al colaborador, reconociendo el resultado de forma positiva, mencionando específicamente que trabajarán juntos en "${necesidadPrincipal.competenciaId}", y haciendo una pregunta abierta para iniciar la conversación sobre cómo le gustaría empezar a mejorar en esa área.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Modelo rápido y eficiente para MVP
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || 'Hola, ¿cómo estás? Estoy aquí para ayudarte a desarrollar tus habilidades.';
    } catch (error) {
      console.error('[ConversationalAgent] Error calling LLM:', error);
      throw new Error('No se pudo generar el saludo inicial del agente.');
    }
  }
}
