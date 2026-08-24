# Dominios del servidor

Esta carpeta reúne la lógica de negocio por responsabilidad. Mantenerla ordenada evita que `server/routers.ts` se convierta en un archivo difícil de revisar y permite que las pruebas permanezcan cerca de la regla que protegen.

| Carpeta | Responsabilidad | Ejemplo de cambio correcto |
|---|---|---|
| `access/` | Verificación de alcance, permisos y acceso a participantes. | Agregar una regla que limita qué participante puede consultar un colaborador. |
| `campaigns/` | Estado de campañas y avisos internos. | Modificar una transición, frecuencia o idempotencia de recordatorios. |
| `learning/` | Recomendaciones de capacitación con salvaguardas humanas. | Ajustar el esquema estructurado de la recomendación. |
| `openapi/` | Contrato OpenAPI de referencia. | Documentar un recurso expuesto por la plataforma. |
| `pilot/` | Instrumentos, participantes, asignaciones, respuestas y diagnósticos. | Agregar una acción E2E para una campaña del piloto. |
| `reporting/` | Serialización y exportación de resultados autorizados. | Incorporar una columna de exportación validada y auditada. |

## Regla de diseño

Cada dominio puede depender de `server/db.ts`, `drizzle/`, `shared/` y la infraestructura estrictamente necesaria de `server/_core/`. No debe depender de React ni de datos demo del cliente. Las pruebas de una regla permanecen en la misma carpeta y usan el sufijo `.test.ts`.

Cuando una capacidad atraviese más de un dominio, el procedimiento de `server/routers.ts` coordina la entrada, la autorización y la llamada al caso de uso; no duplique reglas en el router ni en la interfaz.
