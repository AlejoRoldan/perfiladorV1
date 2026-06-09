import { ScorePorCompetencia, ScoringMatrix, NecesidadDetectada } from './contracts';

/**
 * Motor de Análisis de Necesidades.
 * Responsabilidad: Calcular la brecha entre el score actual y el esperado.
 */
export class NeedsAnalyzer {
  public analyze(
    roleId: string,
    scoresActuales: ScorePorCompetencia[],
    matrix: ScoringMatrix
  ): NecesidadDetectada[] {
    if (!matrix.perfilesEsperados || !matrix.perfilesEsperados[roleId]) {
      return []; // Si no hay perfil esperado para el rol, no hay necesidades detectadas
    }

    const perfilEsperado = matrix.perfilesEsperados[roleId];
    const necesidades: NecesidadDetectada[] = [];

    // Mapeo rápido de scores actuales
    const scoresMap = new Map(
      scoresActuales.map((s) => [s.competenciaId, s.score])
    );

    for (const esperado of perfilEsperado) {
      const scoreActual = scoresMap.get(esperado.competenciaId) || 0;
      const brecha = esperado.scoreMinimoEsperado - scoreActual;

      if (brecha > 0) {
        // Redondeamos la brecha a 2 decimales
        const brechaRedondeada = Math.round(brecha * 100) / 100;
        
        // Determinamos la prioridad según la magnitud de la brecha
        let prioridad: 'ALTA' | 'MEDIA' | 'BAJA' = 'BAJA';
        if (brechaRedondeada >= 2) prioridad = 'ALTA';
        else if (brechaRedondeada >= 1) prioridad = 'MEDIA';

        necesidades.push({
          competenciaId: esperado.competenciaId,
          scoreActual,
          scoreEsperado: esperado.scoreMinimoEsperado,
          brecha: brechaRedondeada,
          prioridad,
        });
      }
    }

    // Ordenar por prioridad (ALTA primero) y luego por brecha descendente
    return necesidades.sort((a, b) => {
      const prioridades = { ALTA: 3, MEDIA: 2, BAJA: 1 };
      if (prioridades[a.prioridad] !== prioridades[b.prioridad]) {
        return prioridades[b.prioridad] - prioridades[a.prioridad];
      }
      return b.brecha - a.brecha;
    });
  }
}
