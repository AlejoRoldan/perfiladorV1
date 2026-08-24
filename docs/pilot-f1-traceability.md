# Perfilador UCorp — trazabilidad del piloto F1

## Alcance acordado

El piloto ahora incorpora la **H1 — autenticación y autorización** mediante el proveedor OAuth configurado, estados de acceso persistentes y RBAC de servidor. Las identidades nuevas entran como `invited` y no ven datos operativos hasta que un administrador las active. El contrato REST conserva Bearer JWT como referencia de la futura API externa, mientras los procedimientos internos usan la sesión segura del proveedor configurado. [1] [2]

El escenario utiliza **12 colaboradores sintéticos**. Para Engineering, el Perfilador F1 ahora consume una representación trazable de la matriz compartida por People & Culture: cuatro competencias, perfiles de Jr a Sr Engineer, Technical Lead y Engineering Manager, más sus anclas conductuales. La normalización 1–4 permite integrarla con F1, pero no convierte el Excel en una regla de promoción. Los valores organizacionales, otros dominios y la plantilla “matriz v5” permanecen como fuentes demo editables. [4]

## Matriz de implementación y aceptación

| HU | Comportamiento implementado | Evidencia de aceptación en demo | Estado |
|---|---|---|---|
| **H1** | Autenticación y autorización. | Acceso mediante OAuth, estados `invited`/`active`/`suspended`, roles de servidor y consola administrativa de aprobación. | Implementada para el acceso a la plataforma; pendiente el filtro por participante cuando se incorporen tablas reales. |
| **H2** | Configuración dual de valores y competencias por área, rol, seniority y cargo. | Vista **Perfilador F1 → Configuración**; permite seleccionar los perfiles oficiales de Engineering, cargar cuatro competencias y anclas conductuales, editar una variante manual, nivel esperado 1–4 y peso. | Implementada |
| **H3** | Sesión tipada con extensión rápida, estándar o profunda y uno o dos flujos. | Vista **Sesión**; muestra la extensión, flujos, participantes y seguimiento de generación. La composición crea 5, 10 o 15 preguntas respectivamente. | Implementada |
| **H4** | Resiliencia de generación. | El estado visible transita por generación; se habilita matriz v5 local, creación manual y reintento. | Implementada |
| **H5** | Revisión humana antes de aprobar y distribuir. | Vista **HITL**; permite editar preguntas, exige flujo no vacío y rúbrica para escenarios prácticos, registra auditoría y bloquea edición luego de aprobar. | Implementada |
| **H6** | Autoevaluación retomable e inmutable después del envío. | Vista **Autoevaluación**; persiste respuestas parciales en `localStorage` por sesión y colaborador demo, las restaura al recargar, exige respuestas requeridas y elimina el borrador local al enviar para bloquear una nueva edición. | Implementada |
| **H7** | Diagnóstico individual por flujo y semáforo. | Vista **Diagnóstico**; muestra niveles real/esperado, brecha, resultados separados, radar y la tolerancia configurable de 0,12 puntos. | Implementada |
| **H8** | Contrato OpenAPI REST del piloto. | Disponible en [`/api/v1/openapi.json`](/api/v1/openapi.json); describe sesiones, HITL, evaluaciones, diagnóstico, errores y el esquema JWT futuro sin activarlo. | Implementada |

## Reglas del modelo aplicadas

Las respuestas se normalizan a la escala común de 1 a 4. El diagnóstico usa una tolerancia de **0,12 puntos**: se considera brecha crítica cuando el nivel real está por debajo del esperado menos la tolerancia, aceptable dentro del intervalo y destacado por encima del esperado más la tolerancia. El diagnóstico incluye solamente los flujos que participaron en la sesión; un flujo no evaluado no se clasifica como una brecha. [1] [3]

> El semáforo es una herramienta de conversación y desarrollo. No produce una decisión automática de movilidad, promoción, compensación, selección o permanencia.

## Controles de demo y límites conocidos

La auditoría registra actor demo, timestamp, acción, detalle y sesión. La autoevaluación pendiente se persiste localmente en el navegador mediante un snapshot versionado, aislado por sesión y colaborador demo; se limpia al envío y no representa retención corporativa, auditoría inmutable ni aislamiento por tenant. Las rutas de movilidad interna y capacitación asistida se mantienen visibles como **funciones futuras**, fuera del alcance del piloto F1.

| Control previsto para producción | Estado en F1 | Próximo paso |
|---|---|---|
| Autenticación y RBAC | OAuth, estados de acceso y roles de servidor activos. | Configurar el IdP corporativo y aplicar aislamiento por tenant y participante en los repositorios reales. |
| Weel y Competency Store | Seed local editable. | Conectar APIs, versionar fuentes y conservar trazabilidad de importación. |
| IA de generación | Borrador simulado y fallback local. | Aplicar proveedor, trazabilidad de prompt, evaluación de calidad y revisión obligatoria. |
| Evidencias | No se cargan archivos ni comentarios reales. | Definir consentimiento, clasificación, retención y controles de acceso. |

## Referencias

[1] [Resumen de requisitos del PRD](source-analysis/prd-summary.md)  
[2] [Resumen de historias de usuario del piloto](source-analysis/user-stories-partial-summary.md)  
[3] [Resumen ejecutivo del modelo de perfilamiento](source-analysis/profiling-model-summary.md)
[4] [Análisis y mapeo de la matriz de Engineering](source-analysis/itti-engineering-matrix-analysis.md)
