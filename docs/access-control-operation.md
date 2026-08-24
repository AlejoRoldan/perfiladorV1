# Operación de identidad y control de acceso

## Propósito

Este incremento sustituye el selector de rol simulado por una **sesión autenticada**, una aprobación explícita de acceso y autorización por rol ejecutada en el servidor. Es el primer control obligatorio antes de incorporar participantes reales; los datos de demostración continúan siendo sintéticos.

> La autenticación verifica **quién entra**; la autorización determina **qué puede hacer**. Es como controlar primero la credencial de entrada de un edificio y después la llave específica de cada sala.

## Flujo de acceso

1. La persona inicia sesión mediante el proveedor OAuth configurado para la plataforma.
2. En su primera sesión se registra una identidad con estado `invited`; no puede ver campañas, evaluaciones, recomendaciones ni datos de participantes.
3. Un administrador de plataforma revisa la identidad en **Configuración → Identidades autorizadas**, asigna el rol mínimo necesario y cambia el estado a `active`.
4. En cada solicitud protegida, el servidor verifica sesión válida, estado `active` y rol permitido. La interfaz acompaña esta regla, pero no la reemplaza.

| Estado | Efecto | Uso operativo |
|---|---|---|
| `invited` | Sesión válida, acceso bloqueado. | Estado inicial después del primer login. |
| `active` | Permite las capacidades de su rol. | Solo después de aprobación explícita. |
| `suspended` | Sesión válida, acceso bloqueado. | Suspensión o salida del piloto. |

## Matriz de roles

| Rol | Navegación habilitada | Permisos de servidor actuales | No permitido |
|---|---|---|---|
| **Colaborador** | Perfil propio, flujo personal y Perfilador. | Inicio/cierre de sesión y autoevaluación local de la demo. | Campañas, recomendaciones IA, configuración, reportes y asignación de accesos. |
| **Líder de equipo** | Panorama acotado, perfil, flujo y Perfilador. | Inicio/cierre de sesión. | Administración de campañas, IA, reportes, configuración y asignación de accesos. |
| **People & Culture** | Gestión de talento, evaluaciones y Perfilador. | Listar, crear y cambiar estado de campañas; solicitar recomendaciones de aprendizaje. | Cambiar roles, estados de acceso o parámetros de plataforma. |
| **Administración de plataforma** | Todas las vistas. | Todos los permisos anteriores y gestión de usuarios, roles y activación/suspensión. | Retirar su propio acceso administrativo activo. |

## Procedimientos protegidos

| Dominio | Protección aplicada |
|---|---|
| `campaigns.*` | `peopleOpsProcedure`: sesión activa con rol `people_ops` o `admin`. |
| `learning.recommend` | `protectedProcedure`: requiere sesión autenticada. |
| `access.listUsers` y `access.updateUser` | `adminProcedure`: sesión activa con rol `admin`; incluye salvaguarda contra auto-suspensión o auto-degradación. |
| `reports.exportSummary` | `adminProcedure`: genera exclusivamente un CSV sintético después de autorizar en el servidor. |
| Cierre de sesión | Requiere sesión autenticada y elimina la cookie de sesión. |

El estado de acceso se consulta en servidor en cada procedimiento protegido. Por lo tanto, suspender una identidad impide sus solicitudes siguientes sin depender de esconder botones en el navegador. La navegación y los botones siguen mostrando el alcance de manera comprensible, pero la decisión de campañas, gestión de accesos y exportación se toma del lado del servidor.

## Preparación de los 20 participantes

Antes de importar información real, el administrador debe confirmar una cuenta administrativa activa, pedir a cada participante que inicie sesión una vez, asignar el rol y estado adecuados, y conservar una aprobación de People & Culture para la campaña. El modelo de tablas, seudónimos, retención y exportación se mantiene en [`pilot-real-participants-storage.md`](pilot-real-participants-storage.md).

La identidad por sí sola no autoriza a cargar datos personales. Cuando se creen los repositorios reales de participantes, respuestas y diagnósticos, cada consulta deberá filtrar por `tenant_id`, campaña y relación de la persona autenticada con ese registro. El **Perfilador F1 sigue siendo un flujo de datos sintéticos compilados en el cliente**: sus pestañas se limitan en la interfaz por rol para mantener el recorrido adecuado, pero no almacena ni consulta registros reales desde el servidor. No debe recibir datos reales hasta mover participantes, sesiones, respuestas y diagnósticos a procedimientos protegidos.

## Límites y siguiente control

El proveedor OAuth actual debe configurarse para usar la identidad corporativa aprobada por Grupo Vázquez antes del piloto real. Esta entrega no asume que cualquier cuenta del proveedor sea una cuenta corporativa: la lista de acceso con estado `invited` funciona como segunda barrera. Como siguiente incremento, se debe implementar el aislamiento por tenant y la autorización por participante/campaña dentro de los repositorios de datos reales, además de auditoría persistente de cambios de permisos.

## Validación

La suite incluye pruebas de roles válidos, límites de People & Culture, bloqueo de colaboradores y usuarios pendientes frente a campañas, y prevención de auto-retiro administrativo. La validación actual ejecuta `pnpm check` y `pnpm test` con **46 pruebas aprobadas**.
