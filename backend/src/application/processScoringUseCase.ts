import { ScoringInputPayload, ScoringMatrix, ScoreCompetenciaEvent } from '../domain/contracts';
import { ScoringEngine } from '../domain/scoringEngine';
import { IEventPublisher } from './eventPublisher.interface';

/**
 * Caso de Uso: Procesar Scoring
 * Orquesta la lógica: Recibe input -> Llama al motor -> Emite evento.
 */
export class ProcessScoringUseCase {
  constructor(
    private readonly scoringEngine: ScoringEngine,
    private readonly eventPublisher: IEventPublisher,
    private readonly matrix: ScoringMatrix
  ) {}

  public async execute(input: ScoringInputPayload): Promise<ScoreCompetenciaEvent> {
    try {
      // 1. Calcular scores usando la lógica de dominio (Determinístico)
      const { scores, ruleVersion } = this.scoringEngine.calculateScores(input.respuestas, this.matrix);

      // 2. Construir el evento de salida
      const event: ScoreCompetenciaEvent = {
        execution_id: input.executionId,
        user_id: input.userId,
        role_id: input.roleId,
        scores_por_competencia: scores,
        matrix_version: this.matrix.version,
        rule_version: ruleVersion,
        timestamp: new Date().toISOString(),
      };

      // 3. Emitir el evento
      await this.eventPublisher.publishScoreEvent(event);

      return event;
    } catch (error) {
      // Manejo de errores sin romper silenciosamente el flujo
      console.error(`[ProcessScoringUseCase] Error processing execution_id: ${input.executionId}`, error);
      throw new Error(`Failed to process scoring: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
