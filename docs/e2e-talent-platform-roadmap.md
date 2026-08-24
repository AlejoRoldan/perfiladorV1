# Hoja de ruta E2E — Itti Talent Compass

## Conclusión ejecutiva

Itti Talent Compass cuenta con una base valiosa: identidad con roles, aislamiento por tenant/piloto/participante, matriz de Engineering trazable, motor de diagnóstico, persistencia de respuestas y bitácora. Sin embargo, hoy es una **plataforma preparada para el piloto, no un proceso E2E operable**. El flujo real se interrumpe después de crear participantes: la interfaz no permite construir y aprobar un instrumento persistente, crear una campaña aislada, asignar evaluaciones, responder desde el canal del colaborador, calcular el diagnóstico, calibrarlo ni exportarlo bajo autorización.

> La plataforma ya tiene el archivador seguro y varias fichas creadas. Falta construir la cadena de trabajo que lleva una evaluación desde el diseño hasta una conversación de talento trazable.

## Línea de referencia del proceso objetivo

| Etapa | Resultado esperado para People & Culture | Fuente de verdad |
|---|---|---|
| 1. Preparar | Tenant, piloto, personas autorizadas y política de retención activos. | `talent_tenants`, `talent_pilots`, identidades y membresías. |
| 2. Configurar | Instrumento versionado, aprobado, explicable y vinculado a una matriz. | `pilot_instruments` y catálogo de matrices. |
| 3. Lanzar | Campaña con población, ventana, responsabilidades y recordatorios idempotentes. | Campaña aislada y asignaciones. |
| 4. Responder | Colaborador guarda y envía su evaluación desde una experiencia propia. | `pilot_assessments` y `pilot_assessment_answers`. |
| 5. Revisar | Líder y People & Culture realizan revisión/calibración con evidencia. | Evaluaciones de múltiples fuentes y decisiones auditadas. |
| 6. Perfilar | Diagnóstico versionado, explicación de brechas y señal de confianza. | `pilot_diagnoses` y motor de cálculo. |
| 7. Actuar | Conversación de desarrollo, capacitación y movilidad, siempre con revisión humana. | Plan de desarrollo y decisiones explícitas. |
| 8. Gobernar | Reportes mínimos, exportación autorizada, retención, auditoría y cierre de campaña. | Repositorios aislados y `pilot_audit_events`. |

## Estado auditado

| Dominio | Estado | Evidencia | Lectura operativa |
|---|---|---|---|
| Identidad, roles y tenant | Disponible | OAuth, roles persistentes, membresías y procedimientos de servidor. [1] | Base adecuada para el piloto. Debe habilitarse y asignarse a cada persona antes de invitarla. |
| Workspace real | Parcial | La ruta del Perfilador usa `PersistentPilotWorkspace` y no mezcla catálogo demo. [2] | Permite ver el piloto y cargar participantes de a uno, pero no operar el ciclo completo. |
| Participantes | Parcial | `pilot.addParticipant` persiste código operativo, atributos organizacionales y vínculo de usuario. [1] | Falta alta masiva, validación de identidad y gestión de invitaciones/revocaciones. |
| Instrumentos | Backend disponible; interfaz demo | `pilot.createInstrument` registra versión, checksum y JSON; el constructor usa `window.setTimeout`. [1] [3] | La configuración visual no crea instrumentos reales ni controla aprobación/versionado. |
| Campañas y avisos | Dos dominios coexistentes | El módulo visible usa `CampaignManager` con `demoEmployees`; existe una campaña aislada mínima y un scheduler heredado global. [1] [4] | Riesgo de operación duplicada y de enviar/mostrar campañas fuera del piloto real. |
| Asignación, respuestas y envío | Backend disponible; interfaz ausente | El repositorio valida alcance, permite guardar, bloquea al enviar y audita. [1] | El colaborador no tiene aún una bandeja de tareas ni formulario conectado a esos procedimientos. |
| Diagnóstico y calibración | Parcial | El motor F1 y `saveDiagnosis` existen; el diagnóstico visual sigue en el flujo demo. [1] [2] | Falta orquestar cálculo, revisión humana, estado de calibración y devolución controlada. |
| Reportes y exportación | Solo demostración | La descarga actual se construye con métricas sintéticas. [5] | No debe utilizarse para resultados de personas hasta crear exportaciones filtradas y auditadas. |
| Movilidad, formación e IA | Exploratorio | La interfaz actual muestra señales y recomendaciones demo. [2] | Debe permanecer fuera de las decisiones de talento hasta recibir datos reales, controles de explicación y aprobación humana. |
| Auditoría, retención y gobierno | Parcial | Eventos del piloto se persisten; ajustes de la pantalla de configuración son demo. [1] [2] | Faltan consulta de auditoría, retención ejecutable y aprobaciones de exportación. |

## Brechas que bloquean el E2E

| Prioridad | Brecha | Riesgo si se omite | Decisión recomendada |
|---|---|---|---|
| P0 | La interfaz de campañas e instrumentos consume datos demo. | El equipo configuraría un ciclo visible que no llega al repositorio aislado. | Sustituir los módulos heredados por un **Centro de ciclo del piloto** conectado solo a `pilot.*`. |
| P0 | No existe una bandeja de evaluaciones reales para el colaborador. | No hay forma de iniciar, guardar, continuar ni enviar una evaluación real. | Construir `Mis evaluaciones` con estado, fecha límite, autosave de servidor y envío definitivo. |
| P0 | No existe orquestación de diagnóstico posterior al envío. | La información se acumula sin generar una señal útil ni trazable. | Ejecutar cálculo determinístico desde instrumento aprobado, guardar versión y requerir revisión de People & Culture. |
| P0 | Los recordatorios no están ligados al modelo aislado del piloto. | Una notificación podría no representar el estado real de una evaluación. | Migrar la cadencia idempotente a campañas/participantes/asignaciones reales y retirar el flujo heredado de producción. |
| P1 | La carga de participantes es individual y no vincula identidades de forma guiada. | Riesgo de errores manuales y cuentas sin acceso a su evaluación. | Implementar importación CSV/HRIS de dos pasos: validar, previsualizar, confirmar y auditar. |
| P1 | Falta evaluación de líder, calibración y reglas de visibilidad. | El perfilamiento quedaría limitado a autoevaluación y no soportaría una conversación profesional. | Modelar fuentes de evaluación, relación líder-colaborador, acuerdo/discrepancia y revisión de calibración. |
| P1 | No hay reportes reales ni exportación con minimización de datos. | People & Culture no puede cerrar el ciclo ni rendir cuentas de forma segura. | Crear vistas agregadas y exportaciones autorizadas por propósito, con filtros obligatorios y auditoría. |
| P1 | La política de retención es informativa. | El piloto conservaría datos más allá de su decisión aprobada. | Añadir tareas de vencimiento, suspensión de acceso, anonimización/depuración y evidencia de ejecución. |
| P2 | Catálogo limitado a Engineering. | El piloto no escala de forma controlada a otras áreas. | Definir un modelo administrable de matriz y cargar Producto, Operaciones y Comercial con gobernanza de versiones. |
| P2 | IA, movilidad y capacitación son señales demo. | Podrían interpretarse como decisión automatizada. | Habilitarlas solo como recomendaciones con explicación, autorización, revisión humana y medición de resultado. |

## Hoja de ruta propuesta

### Fase A — Ciclo mínimo real y seguro

El objetivo es que 20 personas puedan completar una evaluación y que People & Culture reciba diagnósticos revisables, sin recurrir a módulos demo.

| Iniciativa | Alcance técnico | Criterio de salida |
|---|---|---|
| A1. Centro de ciclo del piloto | Reemplazar en `Evaluaciones` el constructor y CampaignManager demo por una vista con selector de piloto, instrumentos persistentes, campañas aisladas y participantes reales. | Toda acción visible se refleja en tablas `pilot_*` o campaña con `tenant_id` y `pilot_id`; no se importan datos de `talentDemo.ts`. |
| A2. Constructor persistente | Convertir el constructor en borrador/versionado: contenido JSON validado por Zod, checksum, revisión y aprobación inmutable. | People & Culture crea una versión, la aprueba y la ve en el listado del piloto; el hash coincide con el instrumento usado en cada evaluación. |
| A3. Asignación y bandeja del colaborador | Crear asignación masiva desde campaña y ruta `Mis evaluaciones`; reutilizar el motor F1 para preguntas, guardado en servidor y envío bloqueado. | Un colaborador solo consulta y responde sus asignaciones; puede reanudar un borrador desde otro dispositivo y no editar luego de enviar. |
| A4. Campaña y avisos reales | Reescribir recordatorios para que consulten evaluaciones pendientes por scope; incorporar pausa, cierre y estados de campaña. | Los avisos son idempotentes, muestran destinatario/estado correctos y se detienen al enviar, cerrar o revocar. |
| A5. Diagnóstico y revisión | Ejecutar el cálculo 1–4 tras el envío, persistir versión/fórmula, abrir una cola de revisión y publicar solo después de aprobación. | Cada diagnóstico apunta a instrumento y evaluación concretos, declara fórmula y es visible únicamente a los roles autorizados. |

### Fase B — Operación de talento y confianza

Esta fase transforma el cierre de una evaluación en una práctica operativa para People & Culture y líderes.

| Iniciativa | Alcance técnico | Criterio de salida |
|---|---|---|
| B1. Carga gobernada de población | Importador CSV/HRIS con mapeo de columnas, validación sin escritura, confirmación, errores por fila y vínculo OAuth. | Las 20 altas pueden corregirse antes de persistir; el sistema no duplica legajos ni crea asignaciones sin identidad/revisión. |
| B2. Evaluación de líder y calibración | Nueva fuente de evaluación, ventana diferenciada, comparación de puntajes y decisión humana documentada. | Cada discrepancia queda visible y la calibración no sobrescribe respuestas originales. |
| B3. Reportería real y exportaciones | Métricas agregadas, detalle con minimización, propósito de exportación y archivo CSV/XLSX generado en servidor. | Toda descarga exige rol, scope y motivo; `pilot_audit_events` conserva quién, qué y cuándo, sin copiar contenido sensible. |
| B4. Gobierno de datos | Panel de auditoría, retención ejecutable, revocación y controles de cierre de piloto. | People & Culture puede demostrar qué se accedió/exportó y que los datos vencidos fueron tratados según política. |

### Fase C — Valor estratégico, una vez estabilizado el ciclo

| Iniciativa | Resultado de negocio | Condición previa |
|---|---|---|
| C1. Matrices multiárea | Comparabilidad y configurabilidad para Producto, Operaciones y Comercial. | Instrumentos persistentes y versionados en producción. |
| C2. Planes de desarrollo | Recomendaciones de aprendizaje accionables, aceptadas y monitoreadas. | Diagnósticos aprobados y taxonomía de formación validada. |
| C3. Movilidad interna | Shortlists explicables como apoyo a conversación, no decisiones automáticas. | Datos de roles objetivo, consentimiento, reglas de equidad y auditoría. |
| C4. IA gobernada | Síntesis y sugerencias con revisión humana, trazabilidad y control de datos compartidos. | Política de uso de IA, evaluación de proveedor y datos mínimos aprobados. |

## Decisiones de arquitectura que conviene fijar ahora

| Decisión | Recomendación |
|---|---|
| Fuente de verdad | El repositorio `pilot_*` aislado es la fuente de verdad del piloto; `talentDemo.ts` solo queda para pruebas visuales explícitas. |
| Modelo de campaña | Consolidar campañas reales en un modelo scoped por tenant/piloto y retirar el administrador heredado antes de invitar usuarios reales. |
| Instrumento | Tratar cada versión aprobada como inmutable. Las modificaciones generan una nueva versión y nunca cambian una evaluación ya asignada. |
| Borradores | Mantener `localStorage` solo como experiencia offline temporal; el servidor debe ser la fuente de verdad y resolver cambios con versión/fecha. |
| Diagnóstico | Mantener el cálculo determinístico y versionado; cualquier IA solo explica o sugiere, nunca decide ni modifica el puntaje. |
| Exportación | Ejecutarla en servidor con alcance, campos mínimos, finalidad declarada, autorización y auditoría. |
| Datos de HRIS | Incorporarlos mediante importador validado o conector de servidor; nunca mediante datos pegados en el cliente sin prevalidación. |

## Indicadores de adopción y control

| Indicador | Definición | Uso |
|---|---|---|
| Cobertura de invitación | Participantes con cuenta vinculada / participantes cargados. | Detectar bloqueos antes del lanzamiento. |
| Tasa de finalización | Evaluaciones enviadas / asignadas por campaña. | Gestionar recordatorios y acompañamiento. |
| Tiempo de ciclo | Desde asignación hasta diagnóstico aprobado. | Dimensionar la operación de People & Culture. |
| Cobertura de revisión | Diagnósticos aprobados / evaluaciones enviadas. | Evitar que se usen resultados no revisados. |
| Exportaciones auditadas | Exportaciones con actor, propósito y scope / exportaciones totales. | Control de gobierno de datos. |
| Incidentes de alcance | Intentos rechazados por tenant/piloto/participante. | Monitorear el aislamiento y configuración de roles. |

## Orden de ejecución recomendado

La próxima implementación debe ser **A1–A5 como un único incremento funcional de ciclo real**, empezando por el Centro de ciclo y la bandeja del colaborador. No conviene invertir en más analítica, IA o visualizaciones mientras el camino de asignar → responder → revisar → diagnosticar no esté conectado al repositorio persistente. Después se debe completar B1–B4 para que el piloto sea repetible y gobernable; solo entonces conviene ampliar matrices y casos de uso estratégicos.

## Fuentes de auditoría

[1] [Repositorio aislado y procedimientos de piloto](../server/pilotRepository.ts)

[2] [Workspace persistente y shell de aplicación](../client/src/features/profiling/PersistentPilotWorkspace.tsx) · [Home](../client/src/pages/Home.tsx)

[3] [Constructor visual de instrumentos](../client/src/features/assessments/InteractiveAssessmentBuilder.tsx)

[4] [Campañas y scheduler de recordatorios heredado](../server/campaigns.ts)

[5] [Exportación sintética actual](../server/reportExports.ts)
