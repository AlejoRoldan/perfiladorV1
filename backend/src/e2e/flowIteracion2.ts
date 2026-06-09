import { ScoringEngine } from '../domain/scoringEngine';
import { ProcessScoringUseCase } from '../application/processScoringUseCase';
import { NeedsAnalyzer } from '../domain/needsAnalyzer';
import { DetectNeedsUseCase } from '../application/detectNeedsUseCase';
import { MockEventPublisher } from '../infrastructure/mockEventPublisher';
import { ScoringMatrix, ScoringInputPayload } from '../domain/contracts';

// Simulamos la clase del Agente (ya que está en otro package, lo hacemos mock aquí para el E2E del backend)
class MockConversationalAgent {
  async generateInitialGreeting(input: any): Promise<string> {
    const necesidad = input.necesidades[0];
    return `[Agente LLM Mock] ¡Hola! He notado que tienes una oportunidad de mejora en ${necesidad.competenciaId}. ¿Te gustaría que trabajemos en eso juntos?`;
  }
}

async function runFlowIteracion2() {
  console.log('--- Iniciando Flujo E2E Iteración 2 ---');

  const publisher = new MockEventPublisher();
  
  // 1. Configuración compartida
  const matrizV2: ScoringMatrix = {
    version: 'v2.0-piloto',
    mapeos: [
      { preguntaId: 'q1', competenciaId: 'Comunicacion', peso: 1 },
      { preguntaId: 'q2', competenciaId: 'Liderazgo', peso: 1 },
    ],
    perfilesEsperados: {
      'tech-lead': [
        { competenciaId: 'Comunicacion', scoreMinimoEsperado: 4 },
        { competenciaId: 'Liderazgo', scoreMinimoEsperado: 4.5 },
      ]
    }
  };

  // 2. Setup Casos de Uso
  const scoringUseCase = new ProcessScoringUseCase(new ScoringEngine(), publisher, matrizV2);
  const needsUseCase = new DetectNeedsUseCase(new NeedsAnalyzer(), publisher, matrizV2);
  const agent = new MockConversationalAgent();

  // 3. Input del Usuario
  const input: ScoringInputPayload = {
    executionId: 'exec-v2-001',
    userId: 'candidato-123',
    roleId: 'tech-lead',
    respuestas: [
      { preguntaId: 'q1', valor: 3 }, // Comunicacion (Brecha: 1 -> Prioridad MEDIA)
      { preguntaId: 'q2', valor: 2 }, // Liderazgo (Brecha: 2.5 -> Prioridad ALTA)
    ]
  };

  try {
    console.log('\n[Paso 1] Procesando Scoring...');
    const scoreEvent = await scoringUseCase.execute(input);

    console.log('\n[Paso 2] Detectando Necesidades a partir del Score...');
    const necesidadEvent = await needsUseCase.execute(scoreEvent);

    if (necesidadEvent) {
      console.log('\n[Paso 3] Inicializando Agente Conversacional...');
      const saludo = await agent.generateInitialGreeting({
        userId: necesidadEvent.user_id,
        roleId: scoreEvent.role_id,
        necesidades: necesidadEvent.necesidades
      });
      console.log('\n💬 Respuesta del Agente:');
      console.log(saludo);
    }

    console.log('\n--- Flujo Iteración 2 completado exitosamente ---');
  } catch (error) {
    console.error('Error en el flujo:', error);
  }
}

runFlowIteracion2();
