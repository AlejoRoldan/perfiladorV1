# Operación de campañas de evaluación

## Alcance implementado

La plataforma permite crear una **campaña persistente** desde la sección **Evaluaciones**. Una campaña vincula un instrumento publicado con una población concreta de colaboradores, una ventana de inicio y cierre, y un calendario de avisos internos.

La primera versión usa el canal elegido para este proyecto: **notificaciones registradas dentro de la plataforma**. No envía correo ni mensajes externos, por lo que no requiere cargar datos de contacto ni conectar un proveedor de mensajería.

## Calendario y zona horaria

La interfaz opera con la zona horaria `America/Asuncion` (Paraguay). El administrador configura las fechas de inicio y cierre; el motor rechaza campañas de menos de 24 horas o cuyo cierre sea anterior al inicio.

| Hito | Momento | Destinatarios |
|---|---|---|
| Apertura | Inicio de la ventana | Participantes pendientes |
| Seguimiento | Punto medio entre inicio y cierre | Participantes pendientes |
| Cierre | 48 horas antes del cierre | Participantes pendientes |

Un único planificador global, protegido y registrado de forma durable, revisa todas las campañas cada hora. Cada hito se registra con una clave idempotente compuesta por campaña, participante y tipo de aviso. Así, un reintento del proceso no duplica avisos ya emitidos. Este modelo evita depender de una sesión de usuario para crear una tarea por cada campaña, algo incompatible con la decisión aprobada de operar la demo sin autenticación.

## Estados de ciclo de vida

| Estado | Significado | Avisos |
|---|---|---|
| `scheduled` | La fecha de inicio aún no llegó. | No se emiten. |
| `active` | La ventana está abierta. | Se evalúan hitos pendientes. |
| `paused` | People & Culture suspendió temporalmente el ciclo. | El trabajo global la omite; no se emiten avisos. |
| `closed` | La ventana terminó o fue cerrada manualmente. | No se emiten. |

Al reanudar una campaña programada antes de su inicio, el motor conserva el estado `scheduled`; no anticipa avisos. Al cerrar una campaña, el trabajo global deja de incluirla, pero se conserva la trazabilidad de participantes y recordatorios.

## Trazabilidad y límites de la demo standalone

Se persisten las campañas, participantes, estado de participación y cada aviso emitido. La interfaz de People & Culture muestra el número de participantes, avance, avisos entregados y el último mensaje registrado.

La demo sigue sin autenticación por la exclusión aprobada de H1. Por ello, las operaciones de crear, pausar, reanudar o cerrar campañas son deliberadamente públicas **solo en este entorno demostrativo**; no constituyen control de permisos. En producción deben requerir autenticación corporativa, rol People & Culture, aislamiento por tenant, auditoría por actor y una política de retención para los avisos.

## Activación del planificador global

La activación se realiza una única vez, **después de publicar** el handler. El proceso crea una tarea de proyecto con el nombre estable `itti-campaign-reminders`, cron `0 0 * * * *` en UTC y callback `POST /api/scheduled/campaign-reminders`; luego persiste su `taskUid`, cron y zona horaria en `assessment_campaign_reminder_schedulers` bajo la clave única `internal-campaign-reminders`.

Repetir la activación no debe crear una segunda fila de configuración: la persistencia se actualiza por `schedulerKey`. Antes de crear una tarea nueva debe revisarse el listado de tareas del proyecto y, si la ya existente está activa, conservarse su identidad. El handler acepta únicamente el `taskUid` registrado; una tarea huérfana devuelve `200` con `skipped: "orphan"` para impedir reintentos inútiles.

## Verificación aplicada

La lógica de calendario cuenta con pruebas unitarias para validar ventanas, transiciones de estado, hitos, pausas y claves idempotentes. Además, una comprobación persistente creó una campaña de Engineering con dos participantes, confirmó su presencia en el listado, emitió dos avisos de apertura, verificó que un reintento emitiera cero duplicados y comprobó que la pausa impide nuevas emisiones. El handler global cuenta con pruebas de solicitud no cron, tarea huérfana y tarea global registrada. La revisión visual comprobó selección de participantes, dos campos de fecha, la cadencia visible y el estado vacío persistente.
