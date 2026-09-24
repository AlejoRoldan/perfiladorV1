import { z } from 'zod';

const allowedRoleIds = ['tech-lead', 'manager-it', 'developer'] as const;
const allowedQuestionIds = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

const identifierSchema = z.string().trim().min(1, 'El valor es obligatorio.').max(120, 'El valor excede la longitud permitida.');

const respuestaSchema = z.object({
  preguntaId: z.enum(allowedQuestionIds),
  valor: z.number().int().min(1).max(5),
});

export const diagnosticoRequestSchema = z.object({
  userId: identifierSchema,
  roleId: z.enum(allowedRoleIds),
  respuestas: z.array(respuestaSchema).length(allowedQuestionIds.length, 'Se requieren las cinco respuestas del cuestionario.').superRefine((respuestas, context) => {
    const questionIds = new Set(respuestas.map((respuesta) => respuesta.preguntaId));

    if (questionIds.size !== allowedQuestionIds.length) {
      context.addIssue({
        code: 'custom',
        message: 'Cada pregunta debe responderse exactamente una vez.',
        path: [],
      });
    }
  }),
});

const necesidadSchema = z.object({
  competenciaId: z.string().trim().min(1).max(80),
  scoreActual: z.number().min(0).max(5),
  scoreEsperado: z.number().min(0).max(5),
  brecha: z.number().min(0).max(5),
  prioridad: z.enum(['ALTA', 'MEDIA', 'BAJA']),
});

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(1_000),
});

export const chatRequestSchema = z.object({
  executionId: identifierSchema,
  userId: identifierSchema,
  roleId: z.enum(allowedRoleIds),
  necesidades: z.array(necesidadSchema).max(10),
  history: z.array(chatMessageSchema).max(20),
  userMessage: z.string().trim().max(1_000).refine(
    (value) => value === '__INIT__' || value.length > 0,
    'El mensaje no puede estar vacío.',
  ),
});

export type DiagnosticoRequest = z.infer<typeof diagnosticoRequestSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
