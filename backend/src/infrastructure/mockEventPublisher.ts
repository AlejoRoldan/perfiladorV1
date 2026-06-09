import { IEventPublisher } from '../application/eventPublisher.interface';
import { ScoreCompetenciaEvent, NecesidadDetectadaEvent } from '../domain/contracts';

/**
 * Adaptador de Infraestructura: MockEventPublisher
 * Implementa la interfaz IEventPublisher.
 * Simularemos la emisión del evento imprimiéndolo en consola de forma estructurada.
 */
export class MockEventPublisher implements IEventPublisher {
  public async publishScoreEvent(event: ScoreCompetenciaEvent): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log(JSON.stringify({
      level: 'INFO',
      message: 'Event published successfully',
      topic: 'ScoreCompetencia',
      payload: event
    }));
  }

  public async publishNecesidadEvent(event: NecesidadDetectadaEvent): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log(JSON.stringify({
      level: 'INFO',
      message: 'Event published successfully',
      topic: 'NecesidadDetectada',
      payload: event
    }));
  }
}
