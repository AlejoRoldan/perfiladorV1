# Guía de contribución

Esta guía describe cómo extender **Itti Talent Compass** sin perder trazabilidad, aislamiento de datos ni claridad arquitectónica. La regla central es sencilla: cada cambio debe tener un lugar predecible, una frontera de responsabilidad y una verificación reproducible.

> Piense el repositorio como un edificio. El frontend es la recepción, los procedimientos de servidor son el control de acceso y la base de datos es el archivo resguardado. Un cambio correcto respeta cada puerta en vez de abrir un atajo entre ellas.

## Inicio rápido

| Acción | Comando | Resultado esperado |
|---|---|---|
| Instalar dependencias | `pnpm install` | Dependencias alineadas con `pnpm-lock.yaml`. |
| Iniciar desarrollo | `pnpm dev` | Aplicación disponible en el entorno local administrado. |
| Verificar tipos | `pnpm check` | TypeScript sin errores. |
| Ejecutar pruebas | `pnpm test` | Suite Vitest aprobada. |
| Verificar accesibilidad | `pnpm test:a11y` | Revisión Axe de la vista inicial. |
| Formatear | `pnpm format` | Archivos formateados con Prettier. |

No versionar archivos `.env`, tokens, respuestas reales, exportaciones CSV operativas ni copias de datos personales.

## Mapa de responsabilidades

| Zona | Responsabilidad | Regla de contribución |
|---|---|---|
| `client/src/features/` | Casos de uso visibles agrupados por dominio. | Agregar una pantalla de evaluación en `assessments`; una experiencia del Perfilador en `profiling`. |
| `client/src/components/` | Componentes reutilizables y superficies compartidas. | No mezclar lógica de negocio con componentes de UI genéricos. |
| `client/src/lib/` | Utilidades de cliente y reglas puras reutilizables. | Mantenerlas deterministas y acompañarlas de pruebas. |
| `client/src/data/` | Datos de demostración explícitamente sintéticos. | Nunca incorporar datos personales o resultados reales. |
| `server/domains/` | Casos de uso y reglas de negocio del servidor. | Organizar una nueva capacidad por dominio y mantener controles de alcance en servidor. |
| `server/routers.ts` | Composición de procedimientos tRPC. | Declarar el contrato; mover reglas complejas al dominio correspondiente. |
| `server/db.ts` y `drizzle/` | Persistencia y definición del esquema. | Mantener esquema, migración y consultas sincronizados. |
| `docs/` | Operación, arquitectura, calidad y fuentes de producto. | Actualizar el índice documental al crear una guía relevante. |

## Flujo para una funcionalidad nueva

1. **Ubique el dominio.** Antes de crear archivos, determine si el cambio pertenece a evaluación, perfilamiento, campañas, reportes, aprendizaje, acceso o plataforma.
2. **Defina el contrato.** Si requiere información persistida, actualice el esquema y diseñe el procedimiento tRPC protegido antes de crear la interfaz.
3. **Aplique los límites de acceso.** Toda lectura o escritura real debe validar sesión activa, rol, `tenantId`, `pilotId` y, si corresponde, el participante asociado.
4. **Construya la interfaz.** Conecte la vista mediante los hooks tRPC existentes y cubra estados de carga, vacío, error y éxito.
5. **Pruebe el comportamiento.** Agregue pruebas de reglas, transiciones y límites de autorización. No considere una prueba visual como sustituto de una prueba de servidor.
6. **Documente el cambio.** Actualice el README, el documento operativo o la guía arquitectónica que corresponda.

## Cambios de datos y seguridad

La base MySQL/TiDB es el registro operativo. El navegador no debe ejecutar SQL ni tomar decisiones de autorización. Las migraciones siguen esta secuencia:

1. Actualizar `drizzle/schema.ts`.
2. Generar la migración con `pnpm drizzle-kit generate`.
3. Revisar el SQL generado y aplicarlo en el entorno mediante el flujo administrado.
4. Implementar consultas y procedimientos de servidor con alcance explícito.
5. Agregar pruebas de autorización, aislamiento y transición de estado.

> Un filtro en la interfaz mejora la experiencia; un filtro en el servidor protege los datos. Para información de talento, se necesitan ambos.

## Convenciones de nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componente React | `PascalCase.tsx` | `PersistentResultsDashboard.tsx` |
| Regla o servicio de dominio | `camelCase.ts` | `pilotRepository.ts` |
| Prueba | Mismo nombre + `.test.ts` | `pilotScope.test.ts` |
| Hoja de estilos por feature | `camelCase.css` | `persistentResultsDashboard.css` |
| Documento operativo | `kebab-case.md` | `evaluation-persistence-operation.md` |
| Documento de decisión | `NNN-tema.md` | `001-aislamiento-por-tenant.md` |

## Definición de terminado

Un cambio está listo para revisión cuando su responsabilidad está clara, sus tipos y pruebas pasan, sus rutas de acceso están protegidas, sus estados de interfaz son comprensibles y su documentación permite a otra persona mantenerlo sin depender del autor original.

## Revisión de cambios

Antes de abrir una solicitud de revisión, complete la plantilla de pull request y verifique al menos `pnpm check` y `pnpm test`. Si modifica seguridad, persistencia, exportaciones o permisos, describa explícitamente el alcance autorizado, los riesgos evaluados y la evidencia de pruebas.

Consulte [`docs/README.md`](docs/README.md) para el catálogo completo de documentación y [`docs/architecture/README.md`](docs/architecture/README.md) para el mapa técnico de módulos.
