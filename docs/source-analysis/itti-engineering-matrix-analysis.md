# Análisis de la matriz de competencias de Engineering — Itti

## Fuente y alcance

El presente análisis deriva del archivo interno **`CopiadeMatrixSkills.xlsx`**, compartido por People & Culture el 13 de agosto de 2026. La matriz contiene dos hojas: `Engineers` y `TL & EM`. Su alcance es exclusivamente **Engineering**; no representa todavía a Producto, Operaciones, Comercial ni otras familias de Grupo Vázquez.

> Regla explícita de progresión de la fuente: **cada columna implica el desarrollo anterior**. En otras palabras, un nivel superior conserva las conductas esperadas del nivel anterior y añade mayor autonomía, impacto y liderazgo.

## Taxonomía extraída

| Competencia oficial | Intención observable resumida |
|---|---|
| Fundamentos técnicos y operativos | Calidad, testing, observabilidad, SLAs, resiliencia, arquitectura, APIs y sostenibilidad técnica. |
| Dominio y visión | Comprensión de negocio, producto, clientes, estrategia y decisiones técnicas con impacto. |
| Ownership y mentoring | Responsabilidad por entregables, resolución de problemas, dependencias, mejora continua y desarrollo de pares. |
| Comunicación y liderazgo | Comunicación clara, colaboración, priorización, feedback, coordinación y gestión de stakeholders. |

| Familia de rol | Nivel de progresión en la fuente | Interpretación en la plataforma |
|---|---:|---|
| Software Engineer | Jr Engineer | Nivel 1: aprendizaje guiado y tareas acotadas. |
| Software Engineer | Ssr Engineer | Nivel 2: autonomía parcial, mejora de prácticas y colaboración técnica. |
| Software Engineer | Sr Engineer | Nivel 3: autonomía, diseño sostenible, mentoría e impacto transversal. |
| Technical Lead | Technical Lead | Nivel 4 de especialización: estándares, arquitectura, liderazgo técnico y multiplicación. |
| Engineering Manager | Engineering Manager | Nivel 4 de gestión: estrategia de equipo, personas, roadmap y stakeholders. |

La codificación 1–4 anterior **no existe numéricamente en el Excel**: es una normalización para integrarla con el motor F1, cuya escala actual es 1–4. No transforma los descriptores en una medición validada; solo permite usar la misma escala como referencia explícita.

## Decisiones de modelado

La plataforma guardará la matriz como una biblioteca de competencias con las siguientes propiedades: `id`, `name`, `description`, `family`, `expectedLevel`, `role`, `seniority`, `behavioralAnchors` y `source`. Los descriptores por rol y nivel se conservarán como **anclas conductuales** para que una persona pueda entender qué evidencia se espera, en lugar de recibir solamente un número.

| Elemento en la matriz | Traducción a producto | Estado |
|---|---|---|
| Competencias repetidas en ambas hojas | Cuatro competencias de Engineering compartidas. | Directo desde la fuente. |
| Columnas Jr, Ssr y Sr | Perfil de `Software Engineer` por seniority. | Directo desde la fuente. |
| Columnas Technical Lead y Engineering Manager | Perfiles independientes de liderazgo técnico y de personas. | Directo desde la fuente. |
| Desarrollo acumulativo entre columnas | Herencia de anclas de los niveles anteriores dentro de la vista de expectativa. | Directo desde la fuente. |
| Tipos de evaluación | Autoevaluación de Engineering, evaluación de manager y conversación de calibración. | Derivado para implementar el proceso; no viene prescrito por el Excel. |

## Límites y controles

La matriz no aporta pesos numéricos, escalas de calificación, umbrales de promoción, preguntas cerradas ni evidencias históricas. Por ello, la plataforma no deberá presentar el nivel esperado como una recomendación automática de promoción ni usarlo para selección. Las respuestas abiertas y la evaluación de manager se revisarán con rúbricas y evidencia humana.

También se conservará el catálogo transversal sintético de la demo para las áreas no cubiertas. La matriz de Engineering sustituirá únicamente los catálogos, roles y evaluaciones asociados a Engineering, evitando inventar una fuente oficial para otras familias.
