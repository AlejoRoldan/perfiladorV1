# Backend

El backend es una API Express escrita en TypeScript. Coordina el motor determinístico, publica eventos de desarrollo, detecta necesidades y actúa como perímetro de seguridad para la integración con OpenAI.

## Ejecución y calidad

Desde `backend/`, usa `npm ci` para una instalación reproducible y `npm run dev` para levantar el servidor. `npm test` ejecuta pruebas unitarias y de contrato. `npm run build` realiza una verificación de tipos sin emitir archivos.

La configuración local vive en `backend/.env`. Parte de `backend/.env.example`; nunca subas el archivo real. Las variables disponibles son `OPENAI_API_KEY`, `OPENAI_MODEL` —con valor por defecto `gpt-5-mini`—, `OPENAI_BASE_URL` opcional para proveedores compatibles y `PORT` opcional, cuyo valor por defecto es `3001`.

## Endpoints

| Ruta | Entrada | Resultado | Error esperado |
|---|---|---|---|
| `GET /api/health` | Ninguna. | `status` y `agentConfigured`. | No aplica. |
| `POST /api/diagnostico` | `userId`, `roleId` y cinco respuestas. | `scoreEvent` y `necesidadEvent`. | `400` si el cuerpo no cumple el esquema. |
| `POST /api/agent/chat` | Contexto del diagnóstico, historial limitado y mensaje. | `reply`. | `400` por entrada inválida; `503` si falta la clave; `502` cuando el proveedor no responde. |

Los roles permitidos son `tech-lead`, `manager-it` y `developer`. Las preguntas válidas son `q1` a `q5`, cada una con un entero entre 1 y 5. El esquema exige que aparezcan las cinco preguntas exactamente una vez.

## Validación y límites

Zod valida la entrada antes de que llegue a un caso de uso. El cuerpo JSON está limitado a 32 KB. El historial del chat admite como máximo 20 mensajes y cada mensaje tiene un máximo de 1.000 caracteres. Estos límites reducen errores accidentales y evitan que una solicitud crezca sin control; no sustituyen controles de producción como autenticación o rate limiting.

Los errores se devuelven como JSON estable y no incluyen trazas ni credenciales. Los detalles de validación identifican el campo incorrecto para facilitar la corrección en la interfaz.

## Pruebas existentes

Las pruebas de `domain/` cubren los motores de scoring y necesidades. Las pruebas de `application/` verifican la publicación de eventos. `presentation/http/requestSchemas.test.ts` comprueba que se acepten diagnósticos completos y se rechacen rangos, duplicados e historiales excesivos. Los scripts en `e2e/` ilustran el flujo de las primeras iteraciones y no requieren una clave real al usar mocks.

## Referencias

[1]: https://expressjs.com/en/guide/routing.html "Express routing guide"
[2]: https://zod.dev/basics "Zod basics"
