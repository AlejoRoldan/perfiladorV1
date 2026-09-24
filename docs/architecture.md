# Arquitectura

El perfilador separa las decisiones de negocio de los mecanismos técnicos. Una regla como “una brecha de dos puntos es prioridad alta” debe poder probarse sin levantar un servidor web o llamar a un modelo de lenguaje. Express, OpenAI y la consola son adaptadores que rodean el núcleo, no dependencias del núcleo.

## Flujo de datos

```text
React / Vite
    │ POST /api/diagnostico
    ▼
Validación Zod ──► ProcessScoringUseCase ──► ScoringEngine
    │                       │                       │
    │                       ▼                       ▼
    │                  EventPublisher        ScoreCompetencia
    │                       │
    │                       ▼
    │               DetectNeedsUseCase ──► NeedsAnalyzer
    │                                           │
    ▼                                           ▼
Resultados ◄──────────── NecesidadDetectada ─────┘
    │ POST /api/agent/chat
    ▼
Validación Zod ──► OpenAI adapter / modelo configurado ──► Respuesta breve
```

## Límites de responsabilidad

| Capa | Ubicación | Responsabilidad | No debe conocer |
|---|---|---|---|
| Dominio | `backend/src/domain` | Reglas de scoring, perfiles y brechas. | HTTP, SDKs, variables de entorno. |
| Aplicación | `backend/src/application` | Casos de uso y puertos de salida. | Detalles de Express o de infraestructura concreta. |
| Infraestructura | `backend/src/infrastructure` | Adaptadores como el publicador mock. | Reglas de presentación. |
| Presentación | `backend/src/presentation/http` y `server.ts` | Esquemas HTTP, códigos de respuesta y composición. | Cálculos internos duplicados. |
| Frontend | `frontend/src` | Estado de la experiencia y visualización. | Credenciales de OpenAI. |
| Agente | `agent/src` | Generar un saludo inicial a partir de necesidades. | Estado de interfaz o almacenamiento de sesiones. |

## Aplicación de SOLID

**Responsabilidad única.** `ScoringEngine` calcula puntuaciones; `NeedsAnalyzer` encuentra brechas; los esquemas HTTP validan límites de entrada; y el cliente del frontend concentra las llamadas fetch. Esta separación permite cambiar una pieza sin que la otra absorba responsabilidades ajenas.

**Abierto/cerrado e inversión de dependencias.** La aplicación se apoya en contratos, como el puerto del publicador de eventos. En un siguiente paso, `MockEventPublisher` puede reemplazarse por un adaptador a una cola sin modificar el caso de uso. La matriz de preguntas y los perfiles se tratan como datos configurables, aunque hoy vivan en `server.ts` para mantener el alcance del MVP.

**Segregación de interfaces y sustitución de Liskov.** Los contratos de dominio son pequeños y describen solo los datos requeridos. Una implementación alternativa de publicación debe cumplir exactamente la interfaz esperada, lo que hace segura su sustitución por pruebas.

## Decisiones de integración

La API maneja el agente porque es la frontera adecuada para las credenciales. El navegador nunca recibe `OPENAI_API_KEY`. El paquete `agent/` se conserva como una implementación aislada y comprobable del saludo inicial; la API de Iteración 3 construye también el contexto de chat para reducir acoplamiento de interfaz.

Los tipos del frontend reflejan, pero no importan todavía, los contratos del backend. Esto evita una configuración de monorepo innecesaria en el MVP. Cuando haya más endpoints o consumidores, se recomienda extraer esos contratos a `packages/contracts` y consumirlos desde ambos lados.

## Referencias

[1]: https://martinfowler.com/bliki/HexagonalArchitecture.html "Hexagonal Architecture"
[2]: https://12factor.net/config "The Twelve-Factor App: Config"
