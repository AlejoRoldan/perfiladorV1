# Operación del constructor persistente de instrumentos

## Propósito

El constructor permite a People & Culture diseñar una evaluación dentro de un piloto real sin convertir la configuración en una campaña ni en una asignación hasta que exista una **versión aprobada**. Un instrumento funciona como una versión controlada de una pauta de evaluación: se puede redactar y revisar; al aprobarla se toma una instantánea inmutable que será la única elegible para campañas.

## Ciclo de estado

| Estado | Acción permitida | Resultado |
|---|---|---|
| `draft` | Editar, guardar y enviar a revisión. | El contenido se valida y permanece modificable. |
| `in_review` | Aprobar con nota de revisión. | La edición se bloquea y se calcula checksum SHA-256. |
| `approved` | Crear nueva versión. | Se crea un snapshot en `pilot_instruments`; la versión aprobada no puede modificarse. |

| Control | Regla aplicada |
|---|---|
| Alcance | Cada operación exige `tenantId` y `pilotId` autorizados para People & Culture o administración. |
| Contenido mínimo | Perfil de referencia, al menos una competencia, dos preguntas 1–4 ponderadas y tres etiquetas visibles de escala. |
| Integridad | El mismo JSON aprobado produce checksum y queda junto a la matriz y fórmula utilizadas. |
| Trazabilidad | Guardado, solicitud de revisión y aprobación generan eventos en `pilot_audit_events`. |
| Inmutabilidad | Un estado `in_review` o `approved` no se puede editar ni reenviar; el cambio requiere una versión nueva. |

## Uso operativo

1. Abrir **Ciclo de evaluación** y seleccionar **Abrir constructor persistente**, o utilizar el enlace protegido `/?view=assessments&assessmentAction=instrument`.
2. Seleccionar perfil, tipo de evaluación y competencias. El constructor inicia con dos evidencias editables para asegurar que el instrumento tiene contenido mínimo.
3. Ajustar preguntas, pesos y referencias de escala. Guardar conserva un borrador persistente aislado del piloto.
4. Elegir **Enviar a revisión** cuando el contenido represente la pauta acordada.
5. Verificar alcance, matriz, fórmula, preguntas y nota de revisión. Elegir **Aprobar versión** para crear el snapshot inmutable.
6. En el siguiente paso del ciclo, vincular únicamente un instrumento aprobado a una campaña real antes de asignar participantes.

## Evidencia de validación

| Verificación | Resultado |
|---|---|
| Constructor visible en escritorio | Formulario persistente legible, con superficies opacas, competencias, evidencias, escala y acciones de guardar/revisión. |
| Constructor visible en móvil 390 × 844 | La navegación se contrae, competencias y evidencias se apilan sin recorte horizontal, y las acciones de borrador/revisión permanecen visibles al final del recorrido. |
| Navegación directa | `assessmentAction=instrument` abre el constructor protegido desde un enlace verificable. |
| Tipos | `pnpm exec tsc --noEmit` sin errores. |
| Pruebas | 16 archivos y 55 pruebas aprobadas; incluye validación de contenido y transiciones inmutables de instrumentos. |

## Límite operativo

El constructor aprueba instrumentos, pero todavía no crea ni asigna una campaña desde la misma pantalla. Esa vinculación debe ser el siguiente incremento del **Centro de ciclo** para completar el tramo instrumento aprobado → campaña real → evaluación asignada.
