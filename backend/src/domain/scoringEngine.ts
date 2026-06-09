import { Respuesta, ScoringMatrix, ScorePorCompetencia } from './contracts';

/**
 * Motor de Scoring Determinístico.
 * Cumple con el principio de Responsabilidad Única (SRP): Solo calcula scores.
 * Es una función pura (sin side effects), garantizando reproducibilidad.
 */
export class ScoringEngine {
  private readonly ruleVersion = '1.0.0';

  /**
   * Calcula el score por competencia dado un set de respuestas y una matriz de configuración.
   */
  public calculateScores(respuestas: Respuesta[], matrix: ScoringMatrix): {
    scores: ScorePorCompetencia[];
    ruleVersion: string;
  } {
    const scoresMap = new Map<string, { totalScore: number; count: number }>();

    // Mapeo rápido de pregunta -> competencia
    const matrixMap = new Map(
      matrix.mapeos.map((m) => [m.preguntaId, m])
    );

    for (const respuesta of respuestas) {
      const mapeo = matrixMap.get(respuesta.preguntaId);
      
      if (!mapeo) {
        // Ignoramos silenciosamente o podríamos loggear.
        // Para un enfoque puro, simplemente continuamos.
        continue;
      }

      const current = scoresMap.get(mapeo.competenciaId) || { totalScore: 0, count: 0 };
      
      // Cálculo: valor de respuesta * peso de la pregunta en la competencia
      current.totalScore += respuesta.valor * mapeo.peso;
      current.count += 1;

      scoresMap.set(mapeo.competenciaId, current);
    }

    // Promediar el score por competencia
    const scores: ScorePorCompetencia[] = [];
    for (const [competenciaId, data] of scoresMap.entries()) {
      // Redondeamos a 2 decimales para evitar flotantes infinitos
      const average = Math.round((data.totalScore / data.count) * 100) / 100;
      scores.push({
        competenciaId,
        score: average,
      });
    }

    return {
      scores,
      ruleVersion: this.ruleVersion,
    };
  }
}
