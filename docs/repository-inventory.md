# Inventario para el repositorio — Itti Talent Compass

## Estado del inventario

El proyecto contiene el código de la demo, la documentación de arquitectura, la trazabilidad del Perfilador UCorp F1 y los tres documentos fuente originales bajo `docs/source/`. Los resúmenes trazables continúan disponibles dentro del proyecto para facilitar la lectura y la verificación de requisitos. [1] [2] [3]

## Código relevante

| Ubicación | Contenido | Propósito |
|---|---|---|
| `client/src/pages/Home.tsx` | Shell de la experiencia People & Culture y deep link `/?view=pilot`. | Conecta el panel general con el Perfilador F1. |
| `client/src/features/profiling/PilotProfiler.tsx` | UI de H2–H8. | Configuración, sesión, HITL, autoevaluación, diagnóstico y contrato. |
| `client/src/features/profiling/pilotDomain.ts` | Tipos, seed de valores/competencias, preguntas y extensiones. | Lenguaje común y datos sintéticos del piloto. |
| `client/src/features/profiling/pilotEngine.ts` | Normalización, validaciones y diagnóstico. | Reglas determinísticas auditables de F1. |
| `client/src/features/profiling/pilotEngine.test.ts` | Pruebas del motor F1. | Protege tolerancia, flujos, sesión y composición por extensión. |
| `server/openapi.ts` | Documento OpenAPI 3.0.3. | Define el contrato REST de demo para H8. |
| `server/openapi.test.ts` | Validaciones del contrato. | Comprueba la publicación y los elementos críticos de OpenAPI. |

## Documentación relevante

| Ubicación | Contenido |
|---|---|
| `README.md` | Arquitectura, instalación, pruebas, limitaciones y capacidades de la demo. |
| `docs/pilot-f1-traceability.md` | Matriz H1–H8, criterios de aceptación, reglas y límites de F1. |
| `docs/quality-checks.md` | Tipado, pruebas, auditoría Axe y revisiones visuales. |
| `docs/ai-learning-recommendations.md` | Contrato y salvaguardas de las rutas de capacitación asistidas. |
| `docs/source-analysis/prd-summary.md` | Resumen trazable del PRD. |
| `docs/source-analysis/user-stories-partial-summary.md` | Resumen trazable de las historias H1–H8. |
| `docs/source-analysis/profiling-model-summary.md` | Resumen ejecutivo de reglas del modelo de perfilamiento. |
| `docs/source/` | PRD, historias de usuario y resumen ejecutivo originales del piloto. |
| `docs/repository-migration.md` | Alcance, procedencia y decisiones de la migración a esta rama. |

## Criterios de mantenimiento

La rama ya contiene los documentos fuente del piloto. Antes de compartirla fuera del equipo, se debe revisar que los documentos no incorporen información personal o confidencial no autorizada, mantener el repositorio **privado** y evitar añadir secretos, dependencias instaladas o artefactos de compilación.

## Referencias

[1] [Resumen de requisitos del PRD](source-analysis/prd-summary.md)  
[2] [Resumen de historias de usuario del piloto](source-analysis/user-stories-partial-summary.md)  
[3] [Resumen ejecutivo del modelo de perfilamiento](source-analysis/profiling-model-summary.md)
