import { chatRequestSchema, diagnosticoRequestSchema } from './requestSchemas';

const validResponses = [
  { preguntaId: 'q1', valor: 4 },
  { preguntaId: 'q2', valor: 3 },
  { preguntaId: 'q3', valor: 5 },
  { preguntaId: 'q4', valor: 2 },
  { preguntaId: 'q5', valor: 4 },
] as const;

describe('requestSchemas', () => {
  it('acepta un diagnóstico completo con valores de 1 a 5', () => {
    const result = diagnosticoRequestSchema.safeParse({
      userId: 'alejo-01',
      roleId: 'tech-lead',
      respuestas: validResponses,
    });

    expect(result.success).toBe(true);
  });

  it('rechaza respuestas duplicadas, incompletas o fuera de rango', () => {
    const result = diagnosticoRequestSchema.safeParse({
      userId: 'alejo-01',
      roleId: 'tech-lead',
      respuestas: [
        { preguntaId: 'q1', valor: 0 },
        { preguntaId: 'q1', valor: 4 },
        { preguntaId: 'q3', valor: 3 },
        { preguntaId: 'q4', valor: 2 },
        { preguntaId: 'q5', valor: 1 },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('limita el historial que se enviará al modelo', () => {
    const result = chatRequestSchema.safeParse({
      executionId: 'exec-1',
      userId: 'alejo-01',
      roleId: 'developer',
      necesidades: [],
      history: Array.from({ length: 21 }, () => ({ role: 'user', content: 'mensaje' })),
      userMessage: 'Hola',
    });

    expect(result.success).toBe(false);
  });
});
