# Perfilador UCorp — trazabilidad del piloto F1

## Alcance acordado

Este piloto implementa las historias **H2 a H8** en una demostración standalone para el área de Producto. La **H1 — autenticación y autorización** se excluye de forma intencional: no hay login, JWT, Okta ni datos personales reales. La interfaz lo comunica como modo de demo y el contrato REST mantiene el esquema Bearer JWT únicamente como preparación para una etapa posterior. [1] [2]

El escenario utiliza **12 colaboradores sintéticos**, tres roles y niveles Junior, Semi senior y Senior. Los valores de Weel, la matriz de competencias y la plantilla “matriz v5” son fuentes demo editables, no fuentes corporativas integradas. [1] [2]

## Matriz de implementación y aceptación

| HU | Comportamiento implementado | Evidencia de aceptación en demo | Estado |
|---|---|---|---|
| **H1** | Autenticación y autorización. | Excluida por decisión aprobada; el modo demo no simula seguridad real. | **Fuera de alcance** |
| **H2** | Configuración dual de valores y competencias por área, rol, seniority y cargo. | Vista **Perfilador F1 → Configuración**; permite importar el seed demo, editar dimensiones, nivel esperado 1–4 y peso. | Implementada |
| **H3** | Sesión tipada con extensión rápida, estándar o profunda y uno o dos flujos. | Vista **Sesión**; muestra la extensión, flujos, participantes y seguimiento de generación. La composición crea 5, 10 o 15 preguntas respectivamente. | Implementada |
| **H4** | Resiliencia de generación. | El estado visible transita por generación; se habilita matriz v5 local, creación manual y reintento. | Implementada |
| **H5** | Revisión humana antes de aprobar y distribuir. | Vista **HITL**; permite editar preguntas, exige flujo no vacío y rúbrica para escenarios prácticos, registra auditoría y bloquea edición luego de aprobar. | Implementada |
| **H6** | Autoevaluación retomable e inmutable después del envío. | Vista **Autoevaluación**; guarda progreso de demo, exige respuestas requeridas y bloquea una nueva edición tras enviar. | Implementada |
| **H7** | Diagnóstico individual por flujo y semáforo. | Vista **Diagnóstico**; muestra niveles real/esperado, brecha, resultados separados, radar y la tolerancia configurable de 0,12 puntos. | Implementada |
| **H8** | Contrato OpenAPI REST del piloto. | Disponible en [`/api/v1/openapi.json`](/api/v1/openapi.json); describe sesiones, HITL, evaluaciones, diagnóstico, errores y el esquema JWT futuro sin activarlo. | Implementada |

## Reglas del modelo aplicadas

Las respuestas se normalizan a la escala común de 1 a 4. El diagnóstico usa una tolerancia de **0,12 puntos**: se considera brecha crítica cuando el nivel real está por debajo del esperado menos la tolerancia, aceptable dentro del intervalo y destacado por encima del esperado más la tolerancia. El diagnóstico incluye solamente los flujos que participaron en la sesión; un flujo no evaluado no se clasifica como una brecha. [1] [3]

> El semáforo es una herramienta de conversación y desarrollo. No produce una decisión automática de movilidad, promoción, compensación, selección o permanencia.

## Controles de demo y límites conocidos

La auditoría registra actor demo, timestamp, acción, detalle y sesión. La persistencia se mantiene en el navegador para permitir el recorrido demostrativo; no representa retención, auditoría inmutable o aislamiento por tenant. Las rutas de movilidad interna y capacitación asistida se mantienen visibles como **funciones futuras**, fuera del alcance del piloto F1.

| Control previsto para producción | Estado en F1 | Próximo paso |
|---|---|---|
| Autenticación y RBAC | Excluido de H1. | Integrar Okta/JWT, roles de servidor y aislamiento por tenant. |
| Weel y Competency Store | Seed local editable. | Conectar APIs, versionar fuentes y conservar trazabilidad de importación. |
| IA de generación | Borrador simulado y fallback local. | Aplicar proveedor, trazabilidad de prompt, evaluación de calidad y revisión obligatoria. |
| Evidencias | No se cargan archivos ni comentarios reales. | Definir consentimiento, clasificación, retención y controles de acceso. |

## Referencias

[1] [Resumen de requisitos del PRD](source-analysis/prd-summary.md)  
[2] [Resumen de historias de usuario del piloto](source-analysis/user-stories-partial-summary.md)  
[3] [Resumen ejecutivo del modelo de perfilamiento](source-analysis/profiling-model-summary.md)
