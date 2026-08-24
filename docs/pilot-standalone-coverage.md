# Cobertura verificable del mockup standalone del Perfilador UCorp

## Criterio de validación

El archivo `Mockup_Agente_Perfilador_UCorp_Standalone.html` define la experiencia visible. Esta matriz verifica que sus ocho vistas se representan como recorridos diferenciados, mientras se preservan las reglas de dominio F1: escala 1–4, tolerancia de 0,12 puntos, revisión humana, persistencia local H6 e inmutabilidad tras el envío.

| # | Vista del mockup | Recorrido implementado | Evidencia en código | Regla preservada |
|---:|---|---|---|---|
| 1 | Inicio / Diagnósticos | Panel operativo de Talento con sesión, estado, diagnóstico y CTA. | `TalentStartPanel.tsx` | Punto de entrada secuencial y visible de las acciones prioritarias. |
| 2 | Configuración integrada | Valores, competencias, matriz Engineering y contexto del perfil. | `PilotProfiler.tsx` · pestaña `config` | Procedencia trazable de la matriz oficial y configuración dual H2. |
| 3 | Sesiones | Listado diferenciado con pipeline visible, metadata de la sesión y acceso a revisión o creación. | `PilotSessionsPanel.tsx` · pestaña `sessions` | Traducción de estados de dominio a borrador, generando, en revisión, distribuida, completada o vencida. |
| 4 | Crear sesión | Cuatro bloques ordenados: propósito, participantes, instrumento y confirmación. | `PilotProfiler.tsx` · pestaña `session` | Resiliencia H3–H4, generación con plantilla/mode manual y reintento. |
| 5 | Aprobar borrador | Editor HITL con rúbricas, regeneración, validación, aprobación y distribución. | `PilotProfiler.tsx` · pestaña `hitl` | No se distribuye sin revisión humana e invariantes completas. |
| 6 | Autoevaluación | Shell independiente del colaborador con progreso, guardado local y envío definitivo. | `PilotProfiler.tsx` · pestaña `assessment` | H6 restaura borrador válido y bloquea respuestas luego del envío. |
| 7 | Reporte propio | Vista de desarrollo del colaborador con fortalezas, siguiente nivel y práctica sugerida. | `CollaboratorReportPanel.tsx` · pestaña `report` | No se presenta como evaluación de desempeño ni decisión laboral. |
| 8 | Diagnóstico de talento | Radar, semáforo, cobertura y tabla de brechas por flujo. | `PilotProfiler.tsx` · pestaña `diagnosis` | `gap = esperado − real` y tolerancia de 0,12 puntos. |

## Navegación y responsividad

El shell de Talento conserva una navegación de flujo y un pie persistente de anterior/continuar. En pantallas móviles, la navegación se transforma en una grilla de dos columnas para evitar desplazamiento horizontal y etiquetas superpuestas. El shell del colaborador se mantiene separado, con encabezado compacto y barra de progreso. La especificación OpenAPI queda disponible como referencia técnica secundaria, fuera del recorrido visible de Talento.

| Comprobación | Resultado |
|---|---|
| Escritorio | El Perfilador se mantiene dentro del shell oscuro ITTI con tarjetas, jerarquía y CTA de acción. |
| Móvil 375 × 812 | No hay recorte horizontal; los cinco pasos de Talento quedan visibles en una grilla compacta. |
| Tipos | `pnpm exec tsc --noEmit` finaliza sin errores. |
| Pruebas | `pnpm test --run` finaliza con 12 archivos y 40 pruebas aprobadas. |
| Pipeline de sesiones | `pilotJourney.test.ts` prueba el mapeo de estados visibles y el cierre como sesión completada. |

## Límites conocidos

La demo no incorpora autenticación corporativa por la exclusión aprobada de H1. Por esa razón, las vistas de colaborador y de Talento son simulaciones seleccionables desde la misma demostración y no deben recibir datos reales hasta aplicar identidad, RBAC de servidor y el diseño de almacenamiento descrito en [`pilot-real-participants-storage.md`](pilot-real-participants-storage.md).
