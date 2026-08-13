# Resumen de requisitos — PRD Perfilador de Competencias GV v1.9

**Fuente:** documento proporcionado por Alejo: `ProductRequirementsDocument(PRD).docx`, versión 1.9, 17 de julio de 2026.

## Alcance confirmado del piloto

El producto es un servicio standalone de perfilamiento para Grupo Vázquez. El flujo objetivo del piloto es: configuración dual de valores y competencias, creación de sesión tipada, borrador del sistema con revisión humana, autoevaluación del colaborador y diagnóstico de brecha esperado versus real. La prioridad operativa declarada es **JTBD 7 → JTBD 6 → JTBD 1**.

| En alcance | Condición clave |
|---|---|
| Configuración de competencias | CRUD de área, rol, seniority, cargo, dimensiones y nivel esperado. |
| Configuración de valores | Dimensiones Weel importadas o cargadas manualmente, escala y nivel esperado. |
| Sesión de perfilamiento | Contexto de rol, seniority y cargo; cuatro tipos de sesión y tres extensiones. |
| Cuestionario | Borrador generado, seis tipos de pregunta y mezcla configurable. |
| HITL | Revisar, editar, regenerar y aprobar antes de distribuir. |
| Autoevaluación | Valores y competencias separados; respuestas inmutables después del envío. |
| Diagnóstico | Brecha = nivel esperado − nivel real, con texto y gráfico por flujo. |

## Exclusiones explícitas

El PRD deja fuera el enrutamiento o catálogo de cursos, la confirmación de RRHH, enrollment en IttiAcademy, evidencia ISO y re-perfilado, diagnóstico grupal/heatmap, evaluación del líder, discrepancias auto–líder, integración API con Weel, multi-cliente B2B y candidatos externos. La autenticación piloto está definida como habilitador, pero será omitida en esta demo por instrucción explícita de Alejo.

## Reglas de producto relevantes

Valores y competencias son flujos configurables e independientes. Valores convive con Weel: la configuración refleja dimensiones Weel por importación o carga manual y no reemplaza la evaluación 360/180 ni incorpora evaluación de líder. El colaborador responde una autoevaluación contextualizada a rol, seniority y cargo, con duración prometida de 5, 10 o 20 minutos según la extensión. El diagnóstico se limita a fundamentar desarrollo antes de cualquier enrutamiento futuro.

## Catálogo funcional del instrumento

| Elemento | Definición para la demo |
|---|---|
| Tipos de perfilamiento | `por_pedido` (un tema solicitado), `obligatorio` (compliance/ética), `matriz_capacidades` (framework completo) y `eval_tecnica` (profundidad técnica y escenarios). |
| Extensión rápida | Aproximadamente 5 minutos y de 4 a 6 preguntas. |
| Extensión estándar | Aproximadamente 10 minutos y de 8 a 12 preguntas. |
| Extensión profunda | Aproximadamente 20 minutos y de 15 a 20 preguntas. |
| Tipos de pregunta | Escala 1–4, opción múltiple, verdadero/falso, completar, escenario práctico y respuesta breve. |
| Evaluación semántica | Requerida para escenario práctico —con rúbrica obligatoria— y respuesta breve. |

En HITL, Talento debe poder ver texto, tipo, dimensión, opciones o rúbrica, tiempo estimado y peso. Las acciones previstas son editar, cambiar tipo, eliminar, reordenar, agregar manualmente y regenerar. El pipeline es secuencial y predecible; no debe operar como un orquestador autónomo.

## Preguntas abiertas identificadas en el PRD

La documentación del PRD cita reglas detalladas para los cuatro tipos de perfilamiento, las tres extensiones, los seis tipos de pregunta, los esquemas de scoring y los criterios completos de aceptación, pero el contenido extraído se truncó antes de esas secciones. Deben confirmarse contra el documento de historias de usuario y el resumen ejecutivo del modelo antes de implementar las HUs.
