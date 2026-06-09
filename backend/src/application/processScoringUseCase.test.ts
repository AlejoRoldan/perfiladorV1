import { ProcessScoringUseCase } from './processScoringUseCase';
import { ScoringEngine } from '../domain/scoringEngine';
import { MockEventPublisher } from '../infrastructure/mockEventPublisher';
import { ScoringInputPayload, ScoringMatrix } from '../domain/contracts';

describe('ProcessScoringUseCase (Contract & Flow Tests)', () => {
  let useCase: ProcessScoringUseCase;
  let mockPublisher: MockEventPublisher;
  let engine: ScoringEngine;
  let mockMatrix: ScoringMatrix;

  beforeEach(() => {
    engine = new ScoringEngine();
    mockPublisher = new MockEventPublisher();
    
    // Espiamos el publicador para verificar el contrato del evento
    jest.spyOn(mockPublisher, 'publishScoreEvent');

    mockMatrix = {
      version: 'v1.0-test',
      mapeos: [{ preguntaId: 'q1', competenciaId: 'c1', peso: 1 }],
    };

    useCase = new ProcessScoringUseCase(engine, mockPublisher, mockMatrix);
  });

  it('debe emitir el evento ScoreCompetencia con el contrato exacto', async () => {
    const input: ScoringInputPayload = {
      executionId: 'exec-123',
      userId: 'user-456',
      roleId: 'role-789',
      respuestas: [{ preguntaId: 'q1', valor: 4 }],
    };

    const result = await useCase.execute(input);

    // Verificamos que el publicador fue llamado con el evento
    expect(mockPublisher.publishScoreEvent).toHaveBeenCalledTimes(1);
    const eventPublished = (mockPublisher.publishScoreEvent as jest.Mock).mock.calls[0][0];

    // Validamos el contrato del evento (Contract Test)
    expect(eventPublished).toHaveProperty('execution_id', 'exec-123');
    expect(eventPublished).toHaveProperty('user_id', 'user-456');
    expect(eventPublished).toHaveProperty('role_id', 'role-789');
    expect(eventPublished).toHaveProperty('matrix_version', 'v1.0-test');
    expect(eventPublished).toHaveProperty('rule_version'); // Viene del engine
    expect(eventPublished).toHaveProperty('timestamp');
    expect(eventPublished.scores_por_competencia).toEqual([{ competenciaId: 'c1', score: 4 }]);
    
    // Verificamos que la salida de la función coincida con el evento
    expect(result).toEqual(eventPublished);
  });

  it('debe manejar errores si el publicador falla', async () => {
    // Simulamos un error en la infraestructura
    jest.spyOn(mockPublisher, 'publishScoreEvent').mockRejectedValueOnce(new Error('Network error'));

    const input: ScoringInputPayload = {
      executionId: 'exec-fail',
      userId: 'user-1',
      roleId: 'role-1',
      respuestas: [],
    };

    await expect(useCase.execute(input)).rejects.toThrow('Failed to process scoring: Network error');
  });
});
