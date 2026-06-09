import { DetectNeedsUseCase } from './detectNeedsUseCase';
import { NeedsAnalyzer } from '../domain/needsAnalyzer';
import { MockEventPublisher } from '../infrastructure/mockEventPublisher';
import { ScoreCompetenciaEvent, ScoringMatrix } from '../domain/contracts';

describe('DetectNeedsUseCase (Contract Tests)', () => {
  let useCase: DetectNeedsUseCase;
  let mockPublisher: MockEventPublisher;
  let analyzer: NeedsAnalyzer;
  let mockMatrix: ScoringMatrix;

  beforeEach(() => {
    analyzer = new NeedsAnalyzer();
    mockPublisher = new MockEventPublisher();
    jest.spyOn(mockPublisher, 'publishNecesidadEvent');

    mockMatrix = {
      version: 'v2.0',
      mapeos: [],
      perfilesEsperados: {
        'role-test': [{ competenciaId: 'Liderazgo', scoreMinimoEsperado: 4 }]
      }
    };

    useCase = new DetectNeedsUseCase(analyzer, mockPublisher, mockMatrix);
  });

  it('debe emitir NecesidadDetectadaEvent si hay brechas', async () => {
    const inputEvent: ScoreCompetenciaEvent = {
      execution_id: 'exec-1',
      user_id: 'user-1',
      role_id: 'role-test',
      scores_por_competencia: [{ competenciaId: 'Liderazgo', score: 2 }],
      matrix_version: 'v2.0',
      rule_version: '1.0',
      timestamp: new Date().toISOString()
    };

    const result = await useCase.execute(inputEvent);

    expect(mockPublisher.publishNecesidadEvent).toHaveBeenCalledTimes(1);
    expect(result).not.toBeNull();
    expect(result?.execution_id).toBe('exec-1');
    expect(result?.necesidades[0].competenciaId).toBe('Liderazgo');
    expect(result?.necesidades[0].brecha).toBe(2);
  });

  it('no debe emitir evento ni fallar si no hay necesidades', async () => {
    const inputEvent: ScoreCompetenciaEvent = {
      execution_id: 'exec-2',
      user_id: 'user-1',
      role_id: 'role-test',
      scores_por_competencia: [{ competenciaId: 'Liderazgo', score: 5 }], // Supera el mínimo
      matrix_version: 'v2.0',
      rule_version: '1.0',
      timestamp: new Date().toISOString()
    };

    const result = await useCase.execute(inputEvent);

    expect(mockPublisher.publishNecesidadEvent).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
