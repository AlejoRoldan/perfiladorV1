import { loadRuntimeConfig } from './config';

describe('loadRuntimeConfig', () => {
  it('usa valores seguros por defecto cuando el entorno está vacío', () => {
    expect(loadRuntimeConfig({})).toEqual({
      port: 3001,
      openAiModel: 'gpt-5-mini',
    });
  });

  it('normaliza los valores configurados y no expone valores vacíos', () => {
    expect(loadRuntimeConfig({
      PORT: '4123',
      OPENAI_API_KEY: '  test-key  ',
      OPENAI_MODEL: '  custom-model  ',
      OPENAI_BASE_URL: '  https://provider.example/v1  ',
    })).toEqual({
      port: 4123,
      openAiApiKey: 'test-key',
      openAiModel: 'custom-model',
      openAiBaseUrl: 'https://provider.example/v1',
    });
  });

  it('descarta puertos no válidos', () => {
    expect(loadRuntimeConfig({ PORT: '99999' }).port).toBe(3001);
  });
});
