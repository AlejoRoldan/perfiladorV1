# Operación del repositorio persistente del Perfilador UCorp F1

## Propósito y límite de esta entrega

El Perfilador ya no carga el catálogo sintético al entrar en `/?view=pilot`. La ruta consulta un **workspace persistente autorizado** y, si el usuario no pertenece a un piloto, muestra un estado vacío sin participantes, sesiones ni respuestas. Una persona administradora puede aprovisionar un tenant y un piloto en borrador; esa operación no siembra datos de colaboradores.

> La autenticación es la puerta del edificio; el alcance persistente es la llave de cada sala. Una sesión válida no basta para acceder a otro tenant, campaña o participante.

## Jerarquía de aislamiento

| Nivel | Tabla raíz | Clave de alcance | Regla aplicada |
|---|---|---|---|
| Organización | `talent_tenants` | `tenant_id` | Cada consulta operativa verifica membresía del tenant, salvo administración de plataforma. |
| Piloto | `talent_pilots` | `tenant_id` + `pilot_id` | Un piloto no puede obtenerse si no pertenece al tenant solicitado. |
| Campaña | `assessment_campaigns` | `tenant_id` + `pilot_id` + `campaign_id` | Las campañas del Perfilador se crean y listan dentro de un único piloto. |
| Participante | `pilot_participants` | `tenant_id` + `pilot_id` + `participant_id` | People & Culture ve códigos operativos; colaborador y líder solo su vínculo autorizado. |
| Instrumento | `pilot_instruments` | `tenant_id` + `pilot_id` + `campaign_id` | Guarda versión de matriz, fórmula, checksum y JSON de instrumento aprobado. |
| Evaluación y respuestas | `pilot_assessments`, `pilot_assessment_answers` | `tenant_id` + `pilot_id` + `assessment_id` + `participant_id` | El servidor valida propietario, estado inmutable y alcance antes de guardar o enviar. |
| Diagnóstico | `pilot_diagnoses` | `tenant_id` + `pilot_id` + `assessment_id` | Se versiona por fórmula y no cruza evaluaciones ni pilotos. |
| Auditoría | `pilot_audit_events` | `tenant_id` + `pilot_id` | Registra actor, acción y metadatos mínimos; nunca copia la respuesta evaluativa al log. |

## Procedimientos protegidos

| Procedimiento | Rol mínimo | Protección principal |
|---|---|---|
| `pilot.listAccessible` | Sesión activa | Administración ve sus tenants; People & Culture requiere membresía; colaborador/líder requiere una participación activa vinculada. |
| `pilot.workspace` | Sesión activa | Rechaza tenant o piloto no vinculados a la identidad. |
| `pilot.bootstrap` | Administración | Crea tenant, membresía del creador y piloto en borrador; no crea participantes. |
| `pilot.addParticipant`, `pilot.createCampaign`, `pilot.createInstrument`, `pilot.assignAssessment`, `pilot.saveDiagnosis` | Administración o People & Culture miembro del tenant | Verifica membresía y que cada dependencia pertenece al mismo tenant y piloto. |
| `pilot.saveOwnAnswers`, `pilot.submitOwnAssessment` | Sesión activa | Comprueba que la evaluación pertenece al participante y que la identidad está vinculada; después del envío bloquea cambios. |

## Flujo operativo recomendado para los 20 participantes

| Paso | Responsable | Resultado esperado |
|---:|---|---|
| 1 | Administración | Crear tenant y piloto con código no reutilizable y fecha de retención. |
| 2 | Administración | Activar las cuentas OAuth y asignar roles. Incluir a People & Culture como miembro del tenant. |
| 3 | People & Culture | Registrar únicamente los campos mínimos de los participantes: identificador de HRIS/legajo, nombre visible, rol, área y vínculo de usuario cuando corresponda. |
| 4 | People & Culture | Crear campaña, aprobar instrumento con checksum y asignar una evaluación por participante. |
| 5 | Colaborador | Guardar borradores y enviar únicamente su propia evaluación. |
| 6 | People & Culture | Calcular y guardar diagnóstico versionado, revisar evidencia y exportar solo resultados autorizados. |
| 7 | Administración | Revisar la bitácora, cerrar el piloto y ejecutar la política de retención aprobada. |

## Provisión operativa actual

El **19 de agosto de 2026** se aprovisionó el espacio inicial para comenzar el piloto real, sin importar información de colaboradores. El tenant está activo y el piloto se mantiene en borrador hasta completar la carga mínima, la campaña y el instrumento aprobado.

| Campo | Valor verificado |
|---|---|
| Tenant | Grupo Vázquez |
| Código de tenant | `grupo-vazquez` |
| Identificador de tenant | `tenant_grupo_vazquez_2026` |
| Piloto | Perfilador UCorp F1 – Piloto real |
| Código de piloto | `ucorp-f1-2026` |
| Identificador de piloto | `pilot_ucorp_f1_2026` |
| Estado inicial | `draft` |
| Retención inicial | 19 de agosto de 2027 |
| Participantes y respuestas al aprovisionar | 0 y 0 |
| Evidencia de gobernanza | 1 membresía administrativa y 1 evento de auditoría `pilot.created` |

## Controles que deben mantenerse

No se deben importar planillas con datos personales mediante el cliente ni copiar respuestas a logs, notificaciones o nombres de archivo. Antes de una carga masiva desde HRIS, se debe implementar un conector de servidor que valide tenant y campaña en cada fila, reporte rechazos sin revelar información de terceros y registre la operación en `pilot_audit_events`.

La ruta de Perfilador persistente no debe volver a leer `talentDemo.ts`. Los catálogos sintéticos conservan su valor para pruebas y demostraciones aisladas, pero no son fuente de datos para el piloto real.
