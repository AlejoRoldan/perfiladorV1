# Agente conversacional

El paquete `agent/` contiene la primera implementación aislada del agente. Su responsabilidad es generar un saludo empático y accionable a partir del rol y de la necesidad de mayor prioridad. La API de Iteración 3 usa el mismo principio para construir el contexto de chat en `backend/src/server.ts`.

## Configuración

El paquete lee `OPENAI_API_KEY`, `OPENAI_MODEL` y `OPENAI_BASE_URL` desde el entorno, cargando un archivo local `.env` cuando existe. El modelo por defecto es `gpt-5-mini`, el mismo valor que usa el backend. Parte de `agent/.env.example` para pruebas aisladas; en la experiencia completa, la configuración relevante se encuentra en `backend/.env`.

Nunca incluyas una clave en código fuente, pruebas, documentación, capturas o mensajes. El constructor acepta una clave opcional para facilitar pruebas controladas, pero la aplicación normal debe depender del entorno.

## Comandos

Desde `agent/`, ejecuta `npm ci`, `npm test` y `npm run build`. La prueba mockea el SDK de OpenAI, por lo que no envía datos ni requiere una clave real.

## Límites de producto

El agente usa un tono de mentor y responde en español. Puede apoyar una reflexión sobre desarrollo, pero no es una herramienta de evaluación laboral definitiva. No debe recibir datos sensibles, emitir decisiones de recursos humanos ni sustituir una conversación con una persona responsable.

La conversación no persiste todavía. La interfaz conserva la sesión en memoria y el backend acepta un historial limitado en cada solicitud. En una etapa posterior, la persistencia debe diseñarse junto con identidad, autorización, retención y privacidad.

## Referencias

[1]: https://platform.openai.com/docs/guides/text "OpenAI text generation guide"
[2]: https://github.com/openai/openai-node "OpenAI Node SDK"
