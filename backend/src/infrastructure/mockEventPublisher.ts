import { IEventPublisher } from '../application/eventPublisher.interface';
import { ScoreCompetenciaEvent } from '../domain/contracts';

/**
 * Adaptador de Infraestructura: MockEventPublisher
 * Implementa la interfaz IEventPublisher.
 * Para este MVP, simularemos la emisión del evento imprimiéndolo en consola de forma estructurada.
 */
export class MockEventPublisher implements IEventPublisher {
  public async publishScoreEvent(event: ScoreCompetenciaEvent): Promise<void> {
    // Simulamos latencia de red
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Log estructurado (JSON) simulando la publicación en un bus de eventos
    console.log(JSON.stringify({
      level: 'INFO',
      message: 'Event published successfully',
      topic: 'ScoreCompetencia',
      payload: event
    }));
  }
}
