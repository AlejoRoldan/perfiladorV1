# Portal de documentación

Este directorio concentra el conocimiento operativo y técnico de Itti Talent Compass. El objetivo es que una persona nueva pueda identificar el documento correcto sin recorrer el repositorio completo.

## Cómo elegir una guía

| Si necesita… | Consulte… |
|---|---|
| Entender la aplicación y sus límites de uso | [`../README.md`](../README.md) |
| Contribuir código o ejecutar verificaciones | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) |
| Ubicar módulos, fronteras y decisiones técnicas | [`architecture/README.md`](architecture/README.md) |
| Operar una campaña, instrumento o reporte real | La sección **Operación del piloto** de esta página. |
| Entender requisitos, HUs y matriz de competencias | La sección **Producto y fuentes**. |
| Revisar evidencia de calidad | La sección **Calidad y referencia**. |

## Arquitectura y desarrollo

| Documento | Alcance |
|---|---|
| [`architecture/README.md`](architecture/README.md) | Mapa técnico, fronteras de responsabilidad y estructura de carpetas. |
| [`repository-inventory.md`](repository-inventory.md) | Inventario de código, documentación y archivos fuente. |
| [`mvp-decisions.md`](mvp-decisions.md) | Decisiones de alcance del MVP. |
| [`e2e-talent-platform-roadmap.md`](e2e-talent-platform-roadmap.md) | Evolución priorizada hacia una plataforma E2E. |

## Operación del piloto

| Documento | Cuándo usarlo |
|---|---|
| [`access-control-operation.md`](access-control-operation.md) | Altas, roles, activación, suspensión y límites de acceso. |
| [`pilot-persistence-operation.md`](pilot-persistence-operation.md) | Aislamiento del workspace por tenant, piloto y participante. |
| [`persistent-instrument-operation.md`](persistent-instrument-operation.md) | Diseño, revisión y aprobación de instrumentos. |
| [`evaluation-persistence-operation.md`](evaluation-persistence-operation.md) | Campañas, asignaciones, respuestas y diagnósticos en MySQL/TiDB. |
| [`results-dashboard-operation.md`](results-dashboard-operation.md) | Filtros, métricas y exportación CSV auditada. |
| [`campaigns-operation.md`](campaigns-operation.md) | Campañas y recordatorios internos. |
| [`pilot-real-participants-storage.md`](pilot-real-participants-storage.md) | Preparación segura de participantes reales. |
| [`ai-learning-recommendations.md`](ai-learning-recommendations.md) | Límites y revisión humana de recomendaciones de capacitación. |

## Producto y fuentes

| Documento | Propósito |
|---|---|
| [`pilot-f1-traceability.md`](pilot-f1-traceability.md) | Trazabilidad de las historias de usuario del Perfilador F1. |
| [`pilot-standalone-coverage.md`](pilot-standalone-coverage.md) | Cobertura de las vistas de la experiencia standalone. |
| [`source-analysis/prd-summary.md`](source-analysis/prd-summary.md) | Síntesis del PRD aportado por el negocio. |
| [`source-analysis/itti-engineering-matrix-analysis.md`](source-analysis/itti-engineering-matrix-analysis.md) | Análisis de la matriz oficial de competencias. |
| [`source-analysis/profiling-model-summary.md`](source-analysis/profiling-model-summary.md) | Modelo de perfilamiento y reglas explicables. |
| [`source-analysis/mockup-perfilador-source-of-truth.md`](source-analysis/mockup-perfilador-source-of-truth.md) | Fuente de verdad visual y funcional del Perfilador. |

## Calidad y referencia

| Documento | Propósito |
|---|---|
| [`quality-checks.md`](quality-checks.md) | Evidencia de pruebas, accesibilidad y validación visual. |
| [`corporate-design-system.md`](corporate-design-system.md) | Tokens y reglas del sistema visual. |
| [`design-references/impeccable-notes.md`](design-references/impeccable-notes.md) | Pautas de diseño frontend evaluadas. |
| [`external-reviews/taste-skill-review.md`](external-reviews/taste-skill-review.md) | Patrones de interactividad evaluados. |

## Decisiones de arquitectura

Las decisiones de largo plazo se registran como ADR en [`architecture/adr/README.md`](architecture/adr/README.md). Un ADR captura el contexto, la decisión, las consecuencias y la evidencia de validación para evitar que decisiones importantes queden solo en conversaciones o commits.
