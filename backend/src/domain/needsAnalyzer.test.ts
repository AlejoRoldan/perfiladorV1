import { NeedsAnalyzer } from './needsAnalyzer';
import { ScoringMatrix, ScorePorCompetencia } from './contracts';

describe('NeedsAnalyzer (Unit Tests)', () => {
  let analyzer: NeedsAnalyzer;
  let mockMatrix: ScoringMatrix;

  beforeEach(() => {
    analyzer = new NeedsAnalyzer();
    mockMatrix = {
      version: 'v2.0',
      mapeos: [],
      perfilesEsperados: {
        'role-dev': [
          { competenciaId: 'Backend', scoreMinimoEsperado: 4 },
          { competenciaId: 'Cloud', scoreMinimoEsperado: 3 },
        ]
      }
    };
  });

  it('debe detectar necesidades y calcular la brecha correctamente', () => {
    const scoresActuales: ScorePorCompetencia[] = [
      { competenciaId: 'Backend', score: 2.5 }, // Brecha: 1.5 -> Prioridad MEDIA
      { competenciaId: 'Cloud', score: 1 },     // Brecha: 2.0 -> Prioridad ALTA
    ];

    const necesidades = analyzer.analyze('role-dev', scoresActuales, mockMatrix);

    expect(necesidades).toHaveLength(2);
    
    // Debe estar ordenado por prioridad (ALTA primero)
    expect(necesidades[0].competenciaId).toBe('Cloud');
    expect(necesidades[0].prioridad).toBe('ALTA');
    expect(necesidades[0].brecha).toBe(2);

    expect(necesidades[1].competenciaId).toBe('Backend');
    expect(necesidades[1].prioridad).toBe('MEDIA');
    expect(necesidades[1].brecha).toBe(1.5);
  });

  it('no debe detectar necesidades si el score actual supera al esperado', () => {
    const scoresActuales: ScorePorCompetencia[] = [
      { competenciaId: 'Backend', score: 5 },
      { competenciaId: 'Cloud', score: 4 },
    ];

    const necesidades = analyzer.analyze('role-dev', scoresActuales, mockMatrix);

    expect(necesidades).toHaveLength(0);
  });

  it('debe devolver array vacío si el rol no tiene perfil esperado', () => {
    const necesidades = analyzer.analyze('role-unknown', [], mockMatrix);
    expect(necesidades).toHaveLength(0);
  });
});
