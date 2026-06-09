import { NeedsAnalyzer } from '../domain/needsAnalyzer';
import { IEventPublisher } from './eventPublisher.interface';
import { ScoreCompetenciaEvent, ScoringMatrix, NecesidadDetectadaEvent } from '../domain/contracts';

/**
 * Caso de Uso: Detectar Necesidades
 * Recibe el evento de ScoreCompetencia, analiza brechas y emite NecesidadDetectadaEvent.
 */
export class DetectNeedsUseCase {
  constructor(
    private readonly needsAnalyzer: NeedsAnalyzer,
    private readonly eventPublisher: IEventPublisher,
    private readonly matrix: ScoringMatrix
  ) {}

  public async execute(scoreEvent: ScoreCompetenciaEvent): Promise<NecesidadDetectadaEvent | null> {
    try {
      // 1. Analizar necesidades usando la lógica de dominio
      const necesidades = this.needsAnalyzer.analyze(
        scoreEvent.role_id,
        scoreEvent.scores_por_competencia,
        this.matrix
      );

      // Si no hay necesidades (no hay brechas o no hay perfil esperado), retornamos null
      if (necesidades.length === 0) {
        console.log(`[DetectNeedsUseCase] No needs detected for execution_id: ${scoreEvent.execution_id}`);
        return null;
      }

      // 2. Construir el evento de salida
      const event: NecesidadDetectadaEvent = {
        execution_id: scoreEvent.execution_id, // Reutilizamos el mismo ID para trazabilidad
        user_id: scoreEvent.user_id,
        necesidades,
        timestamp: new Date().toISOString(),
      };

      // 3. Emitir el evento
      await this.eventPublisher.publishNecesidadEvent(event);

      return event;
    } catch (error) {
      console.error(`[DetectNeedsUseCase] Error processing execution_id: ${scoreEvent.execution_id}`, error);
      throw new Error(`Failed to detect needs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
