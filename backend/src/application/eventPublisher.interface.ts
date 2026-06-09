import { ScoreCompetenciaEvent } from '../domain/contracts';

/**
 * Puerto de salida para publicar eventos.
 * Cumple con el Principio de Inversión de Dependencias (DIP).
 * El caso de uso dependerá de esta interfaz, no de la implementación de Kafka, SQS o Mock.
 */
export interface IEventPublisher {
  publishScoreEvent(event: ScoreCompetenciaEvent): Promise<void>;
}
