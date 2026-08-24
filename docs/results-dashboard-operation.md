# Panel de resultados persistidos

## Propósito

La vista **Reportes** muestra exclusivamente información persistida en MySQL/TiDB para el tenant y piloto autorizados. Sustituye la exportación sintética heredada como entrada principal de resultados. La pantalla conserva estados vacíos honestos mientras el piloto no tenga asignaciones, envíos o diagnósticos.

## Métricas y filtros

| Elemento | Fuente de datos | Uso permitido |
|---|---|---|
| Asignadas | `pilot_assessments` | Seguimiento del volumen de evaluaciones registradas. |
| Enviadas y finalización | `pilot_assessments` | Seguimiento operativo por campaña. |
| Diagnosticadas | `pilot_diagnoses` | Confirmar resultados calculados y versionados. |
| Promedio observado | Diagnósticos del alcance elegido | Señal agregada de análisis; no sustituye revisión humana. |
| Detalle protegido | Evaluaciones y diagnósticos ligados al mismo tenant/piloto/campaña | Identificación por código de reporte, no por nombre visible. |

People & Culture puede filtrar por campaña dentro del piloto actual. El servidor conserva el filtro de `tenantId` y `pilotId` aun cuando el navegador intente modificar parámetros.

## Exportación CSV

La acción **Exportar CSV** usa `pilot.exportResults`. Requiere una finalidad escrita, limita las columnas a seguimiento operativo y resultados autorizados, y genera el archivo en el servidor después de verificar la membresía People & Culture/Administración. Cada solicitud crea un evento en `pilot_audit_events` con actor, alcance, campaña seleccionada y finalidad; el contenido sensible no se replica en el log.

| Campo exportado | Motivo |
|---|---|
| Código de reporte | Permite seguimiento sin exponer un nombre visible. |
| Campaña, estado y fechas operativas | Apoya la gestión de finalización. |
| Puntaje/estado de diagnóstico y versión de fórmula | Permite revisión de resultados con trazabilidad. |
| Tenant y piloto | Mantiene contexto de alcance para conciliación y auditoría. |

## Secuencia de uso

1. Crear una campaña con instrumento aprobado y asignar participantes vinculados a OAuth.
2. Esperar respuestas enviadas y solicitar el cálculo de diagnóstico.
3. Abrir **Reportes** desde la navegación de Gobierno.
4. Elegir, si aplica, una campaña y escribir la finalidad de exportación.
5. Revisar los indicadores y el detalle protegido; descargar CSV solo cuando exista una necesidad operativa legítima.

El panel no genera métricas ficticias. Con cero resultados, muestra valores cero y explica el paso pendiente para que la operación continúe.
