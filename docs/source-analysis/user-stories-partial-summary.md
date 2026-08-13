# Extracción parcial — HUs Perfilador UCorp F1

**Fuente:** documento proporcionado por Alejo: `UserStories·PerfiladorUCorp(pilotoF1).docx`, 5 de agosto de 2026.

## Inventario de historias

| Historia | Capacidad | Estado de alcance para esta demo |
|---|---|---|
| H1 | Autenticación piloto | Excluida por indicación de Alejo. Se conservará el selector de rol demostrativo, sin login ni JWT. |
| H2 | Configurar valores, competencias e importación | En alcance prioritario. |
| H3 | Crear sesión y seguir la generación de borrador | En alcance. |
| H4 | Continuar ante indisponibilidad del generador | En alcance. |
| H5 | Revisar, aprobar y distribuir con HITL | En alcance. |
| H6 | Autoevaluación del colaborador | En alcance. |
| H7 | Diagnóstico de gap | En alcance. |
| H8 | API OpenAPI documentada | En alcance de documentación; debe adaptarse a la exclusión de HU1. |

## Criterios y reglas confirmados

### H2 — Configuración

Valores requiere al menos una dimensión y niveles esperados entre 1 y 4. Competencias requiere un selector completo —área, rol, seniority y cargo— y al menos una dimensión. La importación admite `weel_export` para valores y `seed_itti` para competencias; fuente desconocida y esquema malformado deben ser visibles como error. La integración en vivo con Weel y el versionado histórico quedan fuera.

### H3 — Sesión y generación

Una sesión elige tipo, extensión, flujos y participantes. Parte en `draft`, pasa a `generating` y culmina en `in_review`; el estado expone intento, mensaje claro y cuestionarios listos. El contrato original usa flujo asíncrono y garantiza que no quede bloqueada en `generating` después de 120 segundos por intento. Para la demo, la generación debe visualizar sus estados pero no requiere una espera real de 120 segundos.

### H4 — Resiliencia

Ante degradación, se ofrece usar plantilla o crear cuestionario manual; ante fallo definitivo, reintentar o crear manual. Plantilla y manual dejan la sesión en `in_review`; el manual comienza sin preguntas y no puede aprobarse hasta completar al menos una por flujo. Las acciones fuera de estados degradados deben mostrar un error de estado claro.

### H5 — HITL

El equipo de Talento puede editar preguntas mientras la sesión es editable y debe registrarse la acción. Las preguntas de escenario práctico requieren rúbrica no vacía. La regeneración puede resultar indisponible y debe comunicarlo. Una sesión aprobada o activa no se edita. La aprobación exige una o más preguntas por cada flujo activo y rúbricas completas; la distribución solo procede desde `approved`, crea una evaluación por participante y pasa a `active`. Las mismas invariantes aplican a borradores de origen `ai`, `template` y `manual`.

### H6 — Autoevaluación

El colaborador consulta una evaluación en progreso, guarda respuestas parciales y puede retomar exactamente el progreso. Al enviar todas las preguntas obligatorias, el estado pasa a `submitted`, dispara el cálculo y queda inmutable: no admite reenvío ni edición. La demo debe señalar claramente preguntas pendientes antes de permitir enviar y presentar que el resultado se procesa después de la entrega.

### H7 — Diagnóstico

Una evaluación enviada y con scoring terminado habilita un diagnóstico separado para valores y competencias. Cada dimensión expone nivel esperado, real y brecha (`esperado − real`) y la visualización incorpora radares independientes por flujo. Si el scoring sigue pendiente, el diagnóstico no está disponible. La narrativa interpretativa y el enrutamiento de cursos están fuera de la HU.

### H8 — OpenAPI

La especificación debe documentar estados de sesión `draft`, `generating`, `in_review`, `generation_degraded`, `generation_failed`, `approved`, `active` y `closed`; estados de generación `pending`, `running`, `completed`, `degraded` y `failed`; y orígenes de cuestionario `ai`, `template` y `manual`. Como la demo excluye H1, el contrato documentará un **modo demostración sin autenticación** y dejará el Bearer JWT como integración futura, no como requisito operativo.

## Invariantes de negocio detectadas

| ID | Regla |
|---|---|
| INV-S0 | Una sesión no puede quedar indefinidamente en `generating`. |
| INV-S1 | No se aprueba una sesión si un flujo activo no tiene al menos una pregunta. |
| INV-S2–S4 | Referenciadas en H5; pendientes de lectura completa para expresarlas con precisión. |

## Preguntas técnicas que pueden requerir decisión

La historia H4 plantea una cuestión abierta: si las plantillas “matriz v5” se mantienen en el Perfilador o en el motor generador. Para la demo, se puede mantener una plantilla sintética local, salvo que Alejo indique una fuente oficial distinta.
