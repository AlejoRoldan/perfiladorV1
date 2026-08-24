# Operación persistente de evaluaciones — MySQL/TiDB

## Qué se conectó

El ciclo de evaluación ya no depende de objetos locales para registrar la operación. La aplicación usa la conexión administrada `DATABASE_URL` a **MySQL/TiDB** mediante Drizzle ORM y procedimientos tRPC de servidor. El cliente nunca escribe SQL ni recibe acceso directo a la base; solicita una acción al servidor y este valida identidad, tenant, piloto y participante antes de persistir.

> Una evaluación se comporta como un expediente: el navegador prepara la información, pero el servidor decide si puede abrirlo, actualizarlo o cerrarlo y deja la evidencia en la base de datos.

## Recorrido de datos

| Paso visible | Acción de servidor | Registros persistidos | Control de seguridad |
|---|---|---|---|
| Crear campaña | `pilot.createCampaignFromInstrument` | `assessment_campaigns` | Solo People & Culture o Administración miembro del tenant; exige instrumento aprobado del mismo piloto. |
| Asignar población | `pilot.assignCampaign` | `pilot_assessments`, `assessment_campaign_participants` | Cada persona debe pertenecer al mismo tenant/piloto y tener una cuenta OAuth activa vinculada. |
| Abrir bandeja | `pilot.myAssessments` | Lectura de `pilot_assessments`, `pilot_assessment_answers`, `pilot_instruments` | El colaborador solo recibe sus propias evaluaciones; el filtro por `assessment_id` se aplica en la consulta de base. |
| Guardar borrador | `pilot.saveOwnAnswers` | `pilot_assessment_answers`, `pilot_assessments` | Rechaza usuario no vinculado, evaluación de otro participante o evaluación cerrada. |
| Enviar | `pilot.submitOwnAssessment` | Respuestas con fecha de envío y evaluación bloqueada | La transición es definitiva; no admite modificaciones posteriores. |
| Calcular diagnóstico | `pilot.calculateDiagnosis` | `pilot_diagnoses` | Cálculo determinístico desde el instrumento aprobado, con versión de fórmula y evidencia de auditoría. |

## Tablas involucradas

| Tabla | Responsabilidad |
|---|---|
| `talent_tenants`, `talent_pilots`, `talent_tenant_members` | Alcance organizacional y membresías autorizadas. |
| `pilot_participants` | Población del piloto, código operativo y vínculo opcional/activo con `users`. |
| `pilot_instrument_drafts`, `pilot_instruments` | Borradores, versión aprobada, checksum e instrumento inmutable. |
| `assessment_campaigns` | Ventana, zona horaria, estado y vínculo con el instrumento aprobado. |
| `assessment_campaign_participants`, `pilot_assessments` | Asignación de campaña y expediente individual de evaluación. |
| `pilot_assessment_answers` | Respuestas por pregunta, valor escalar y fecha de envío. |
| `pilot_diagnoses` | Resultado calculado, brechas, cobertura y versión de fórmula. |
| `pilot_audit_events` | Actor, acción y alcance; no duplica respuestas sensibles en los metadatos. |

## Condiciones para iniciar la primera evaluación real

1. Crear y aprobar un instrumento desde el constructor persistente.
2. Registrar participantes y vincularlos a una **cuenta OAuth activa**. Sin este vínculo la persona se conserva como invitada, pero no puede recibir ni consultar una evaluación.
3. En **Ciclo de evaluación**, crear una campaña ligada a la versión aprobada y asignar la población elegible.
4. El colaborador ingresa con su cuenta y responde desde su bandeja; cada guardado y envío se registra en MySQL/TiDB.
5. People & Culture calcula y revisa el diagnóstico antes de compartir resultados o generar cualquier exportación.

## Aislamiento obligatorio

Cada procedimiento requiere `tenantId` y `pilotId`. Las operaciones que alcanzan a una persona además comprueban el `participantId` y el vínculo con el usuario autenticado. Las respuestas se filtran en el servidor por los identificadores de las evaluaciones pertenecientes al colaborador, no solamente después de llegar al cliente. Esto impide que un usuario consulte registros de otro participante incluso si modifica parámetros de una solicitud.

## Estado inicial del piloto Itti

El tenant Grupo Vázquez y el piloto UCorp F1 ya están aprovisionados, pero no contienen instrumentos aprobados, participantes o respuestas. Por ello, el nuevo Centro de evaluación muestra estados vacíos operativos y no crea información ficticia. La siguiente acción real es configurar y aprobar la primera versión del instrumento, seguida de vincular cuentas OAuth a la población autorizada.
