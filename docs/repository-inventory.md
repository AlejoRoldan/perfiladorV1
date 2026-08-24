# Inventario para el repositorio — Itti Talent Compass

## Estado del inventario

El proyecto ya contiene el código de la demo, la documentación de arquitectura y la trazabilidad del Perfilador UCorp F1. Los tres documentos originales recibidos permanecen como archivos fuente fuera del directorio de proyecto; para el repositorio futuro deberán incorporarse bajo `docs/source/` sin alterar los archivos originales. Sus resúmenes trazables ya están disponibles dentro del proyecto. [1] [2] [3]

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

## Antes de crear el repositorio

Antes de inicializar o publicar el repositorio, conviene copiar los tres documentos DOCX originales a `docs/source/`, revisar que no se incluyan secretos, crear un `.gitignore` adecuado para artefactos locales y confirmar el propietario de la organización de GitHub. El repositorio debería permanecer **privado** mientras el piloto contiene documentación de procesos internos.

## Referencias

[1] [Resumen de requisitos del PRD](source-analysis/prd-summary.md)  
[2] [Resumen de historias de usuario del piloto](source-analysis/user-stories-partial-summary.md)  
[3] [Resumen ejecutivo del modelo de perfilamiento](source-analysis/profiling-model-summary.md)
