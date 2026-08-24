import { z } from "zod";
import { invokeLLM, listLLMModels } from "../../_core/llm";

const competencySignalSchema = z.object({
  name: z.string().trim().min(2).max(80),
  observed: z.number().int().min(1).max(5),
  expected: z.number().int().min(1).max(5),
}).strict();

export const learningRecommendationInputSchema = z.object({
  role: z.string().trim().min(2).max(80),
  seniority: z.string().trim().min(2).max(40),
  interests: z.array(z.string().trim().min(2).max(80)).min(1).max(4),
  competencies: z.array(competencySignalSchema).min(1).max(8),
  evidenceCount: z.number().int().min(0).max(99),
  evaluationStatus: z.enum(["Al día", "En evaluación", "Requiere revisión"]),
}).strict();

export type LearningRecommendationInput = z.infer<typeof learningRecommendationInputSchema>;

const learningActivitySchema = z.object({
  title: z.string().trim().min(4).max(90),
  format: z.enum(["Curso guiado", "Práctica aplicada", "Acompañamiento", "Lectura guiada"]),
  objective: z.string().trim().min(12).max(180),
  duration: z.string().trim().min(3).max(40),
}).strict();

export const learningRecommendationSchema = z.object({
  priority: z.string().trim().min(4).max(90),
  rationale: z.string().trim().min(20).max(360),
  activities: z.array(learningActivitySchema).min(2).max(3),
  conversationPrompt: z.string().trim().min(12).max(220),
  humanReview: z.string().trim().min(12).max(220),
}).strict();

export type LearningRecommendation = z.infer<typeof learningRecommendationSchema>;

const learningResponseJsonSchema = {
  type: "object",
  properties: {
    priority: { type: "string", minLength: 4, maxLength: 90 },
    rationale: { type: "string", minLength: 20, maxLength: 360 },
    activities: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 4, maxLength: 90 },
          format: { type: "string", enum: ["Curso guiado", "Práctica aplicada", "Acompañamiento", "Lectura guiada"] },
          objective: { type: "string", minLength: 12, maxLength: 180 },
          duration: { type: "string", minLength: 3, maxLength: 40 },
        },
        required: ["title", "format", "objective", "duration"],
        additionalProperties: false,
      },
    },
    conversationPrompt: { type: "string", minLength: 12, maxLength: 220 },
    humanReview: { type: "string", minLength: 12, maxLength: 220 },
  },
  required: ["priority", "rationale", "activities", "conversationPrompt", "humanReview"],
  additionalProperties: false,
} as const;

export function buildLearningPrompt(input: LearningRecommendationInput) {
  return JSON.stringify({
    contexto: {
      rol: input.role,
      seniority: input.seniority,
      interesesDeDesarrollo: input.interests,
      evidenciaDisponible: input.evidenceCount,
      estadoDeEvaluacion: input.evaluationStatus,
    },
    competencias: input.competencies,
    instrucciones: [
      "Propón una ruta de aprendizaje en español, breve, concreta y práctica.",
      "Usa solo las señales entregadas; no infieras atributos personales ni redactes evaluaciones de valor sobre la persona.",
      "Prioriza máximo tres brechas observables y vincula las actividades a esas brechas o intereses declarados.",
      "No recomiendes ni sugieras decisiones de promoción, movilidad, compensación, permanencia o selección.",
      "Usa modalidades genéricas; no inventes cursos, catálogos, certificaciones ni integraciones existentes.",
      "Incluye siempre una frase que pida revisión humana con la persona y People & Culture.",
      "Mantén priority en 90 caracteres, rationale en 360, objective en 180 y los demás textos en 220 caracteres o menos.",
    ],
  });
}

async function selectLearningModel() {
  const { data } = await listLLMModels();
  const ids = new Set(data.map(model => model.id));
  const model = ["gpt-5-mini", "gpt-5-nano"].find(id => ids.has(id));

  if (!model) {
    throw new Error("No hay un modelo compatible disponible para recomendaciones de aprendizaje.");
  }

  return model;
}

export async function recommendLearningPath(rawInput: LearningRecommendationInput): Promise<LearningRecommendation> {
  const input = learningRecommendationInputSchema.parse(rawInput);
  const model = await selectLearningModel();
  const response = await invokeLLM({
    model,
    messages: [
      {
        role: "system",
        content: "Eres un asistente de desarrollo para People & Culture. Generas sugerencias educativas estructuradas, explicables y prudentes. Nunca tomas ni recomiendas decisiones laborales.",
      },
      { role: "user", content: buildLearningPrompt(input) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "learning_recommendation",
        strict: true,
        schema: learningResponseJsonSchema,
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (typeof content !== "string") {
    throw new Error("La recomendación de aprendizaje no devolvió contenido estructurado.");
  }

  return learningRecommendationSchema.parse(JSON.parse(content));
}
