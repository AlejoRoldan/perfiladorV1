import { ScoringEngine } from '../domain/scoringEngine';
import { ProcessScoringUseCase } from '../application/processScoringUseCase';
import { MockEventPublisher } from '../infrastructure/mockEventPublisher';
import { ScoringMatrix, ScoringInputPayload } from '../domain/contracts';

/**
 * Script de Validación E2E Técnica (Smoke Test)
 * Simula 3 corridas consecutivas exitosas con resultados consistentes.
 */
async function runSmokeTest() {
  console.log('--- Iniciando Smoke Test (E2E) del Perfilador ---');

  // 1. Setup de dependencias (Inyección manual para el MVP)
  const engine = new ScoringEngine();
  const publisher = new MockEventPublisher();
  
  // Matriz de configuración simulada (cerrada para el piloto)
  const matrizPiloto: ScoringMatrix = {
    version: 'v1.0-piloto',
    mapeos: [
      { preguntaId: 'q1', competenciaId: 'Liderazgo', peso: 1 },
      { preguntaId: 'q2', competenciaId: 'Liderazgo', peso: 1 },
      { preguntaId: 'q3', competenciaId: 'Innovacion', peso: 1 },
    ]
  };

  const useCase = new ProcessScoringUseCase(engine, publisher, matrizPiloto);

  // 2. Definición del Mock de Entrada
  const mockInput: ScoringInputPayload = {
    executionId: 'exec-demo-001',
    userId: 'candidato-890',
    roleId: 'manager-it',
    respuestas: [
      { preguntaId: 'q1', valor: 4 }, // Liderazgo
      { preguntaId: 'q2', valor: 5 }, // Liderazgo -> Promedio 4.5
      { preguntaId: 'q3', valor: 3 }, // Innovacion -> Promedio 3
    ]
  };

  // 3. Ejecutar 3 corridas consecutivas
  for (let i = 1; i <= 3; i++) {
    console.log(`\nEjecutando corrida #${i}...`);
    // Modificamos el executionId para simular distintas ejecuciones pero con misma data
    const input = { ...mockInput, executionId: `exec-demo-00${i}` };
    
    try {
      const result = await useCase.execute(input);
      console.log(`Corrida #${i} exitosa. Evento emitido:`, JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(`Corrida #${i} falló:`, error);
      process.exit(1);
    }
  }

  console.log('\n--- Smoke Test completado exitosamente. Evidencia generada en logs. ---');
}

// Ejecutar el script
runSmokeTest();
