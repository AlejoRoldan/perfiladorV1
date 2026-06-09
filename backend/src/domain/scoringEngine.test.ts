import { ScoringEngine } from './scoringEngine';
import { ScoringMatrix, Respuesta } from './contracts';

describe('ScoringEngine (Unit Tests)', () => {
  let engine: ScoringEngine;
  let mockMatrix: ScoringMatrix;

  beforeEach(() => {
    engine = new ScoringEngine();
    mockMatrix = {
      version: 'v1.0-test',
      mapeos: [
        { preguntaId: 'q1', competenciaId: 'c1', peso: 1 },
        { preguntaId: 'q2', competenciaId: 'c1', peso: 1 },
        { preguntaId: 'q3', competenciaId: 'c2', peso: 1 },
      ],
    };
  });

  it('debe calcular el score promedio correcto por competencia', () => {
    const respuestas: Respuesta[] = [
      { preguntaId: 'q1', valor: 4 },
      { preguntaId: 'q2', valor: 5 }, // c1 promedio: 4.5
      { preguntaId: 'q3', valor: 3 }, // c2 promedio: 3
    ];

    const result = engine.calculateScores(respuestas, mockMatrix);

    expect(result.scores).toHaveLength(2);
    expect(result.scores.find(s => s.competenciaId === 'c1')?.score).toBe(4.5);
    expect(result.scores.find(s => s.competenciaId === 'c2')?.score).toBe(3);
  });

  it('debe ignorar respuestas a preguntas no mapeadas sin fallar', () => {
    const respuestas: Respuesta[] = [
      { preguntaId: 'q1', valor: 5 },
      { preguntaId: 'q_desconocida', valor: 1 },
    ];

    const result = engine.calculateScores(respuestas, mockMatrix);

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].competenciaId).toBe('c1');
    expect(result.scores[0].score).toBe(5);
  });

  it('debe devolver array vacío si no hay respuestas válidas', () => {
    const result = engine.calculateScores([], mockMatrix);
    expect(result.scores).toEqual([]);
  });

  it('debe garantizar reproducibilidad (misma entrada = misma salida)', () => {
    const respuestas: Respuesta[] = [{ preguntaId: 'q3', valor: 2 }];
    const result1 = engine.calculateScores(respuestas, mockMatrix);
    const result2 = engine.calculateScores(respuestas, mockMatrix);
    
    expect(result1).toEqual(result2);
  });
});
