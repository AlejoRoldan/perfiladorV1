import 'dotenv/config';

export interface RuntimeConfig {
  port: number;
  openAiModel: string;
  openAiApiKey?: string;
  openAiBaseUrl?: string;
}

const DEFAULT_PORT = 3001;
const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';

function readPort(value: string | undefined): number {
  if (!value) {
    return DEFAULT_PORT;
  }

  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port <= 65_535 ? port : DEFAULT_PORT;
}

/**
 * Construye la configuración de ejecución a partir del entorno.
 * Las credenciales no se registran ni se devuelven por HTTP.
 */
export function loadRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const openAiApiKey = env.OPENAI_API_KEY?.trim();
  const openAiBaseUrl = env.OPENAI_BASE_URL?.trim();
  const openAiModel = env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;

  return {
    port: readPort(env.PORT),
    openAiModel,
    ...(openAiApiKey ? { openAiApiKey } : {}),
    ...(openAiBaseUrl ? { openAiBaseUrl } : {}),
  };
}
