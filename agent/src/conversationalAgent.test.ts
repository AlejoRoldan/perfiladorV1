import { ConversationalAgent, AgentInput } from './conversationalAgent';

// Mock de OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: '¡Hola! He notado que podemos mejorar en Liderazgo. ¿Por dónde empezamos?'
                }
              }
            ]
          })
        }
      }
    };
  });
});

describe('ConversationalAgent', () => {
  let agent: ConversationalAgent;

  beforeEach(() => {
    agent = new ConversationalAgent('fake-api-key');
  });

  it('debe generar un saludo enfocado en la necesidad de mayor prioridad', async () => {
    const input: AgentInput = {
      userId: 'user-1',
      roleId: 'Manager',
      necesidades: [
        {
          competenciaId: 'Liderazgo',
          scoreActual: 2,
          scoreEsperado: 4,
          brecha: 2,
          prioridad: 'ALTA'
        }
      ]
    };

    const response = await agent.generateInitialGreeting(input);

    expect(response).toContain('Liderazgo');
  });

  it('debe felicitar al usuario si no hay necesidades', async () => {
    const input: AgentInput = {
      userId: 'user-1',
      roleId: 'Manager',
      necesidades: []
    };

    const response = await agent.generateInitialGreeting(input);

    expect(response).toContain('exactamente donde necesitamos que estés');
  });
});
