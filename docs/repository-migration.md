# Migración a `perfiladorOPOSV1`

## Propósito

Esta rama contiene la versión demostrativa de **Itti Talent Compass** y el **Perfilador UCorp F1**. Sustituye el prototipo técnico anterior de la rama por el proyecto actual basado en React, TypeScript, Tailwind, tRPC, Express y Vitest.

> La autenticación corporativa (HU1) se excluye de este alcance. La demo está diseñada para operar sin login y no representa un control de acceso real.

## Contenido migrado

| Grupo | Contenido |
|---|---|
| Producto | Panel de People & Culture, perfilamiento H2–H8, analítica y módulos demostrativos. |
| Reglas | Motor de diagnóstico con escala 1–4, tolerancia configurable, estados de sesión y bloqueo posterior al envío. |
| API | Contrato OpenAPI publicado en `/api/v1/openapi.json`, preparado para JWT/Okta futuro. |
| Documentación | PRD, HUs, resumen ejecutivo, trazabilidad, controles de calidad, decisiones y catálogo del repositorio. |
| Diseño | Nota de aplicación de pautas de Impeccable en `docs/design-references/impeccable-notes.md`. |

## Decisiones de migración

La estructura anterior de `agent/`, `backend/` y `frontend/` se elimina deliberadamente de esta rama para evitar que coexistan dos aplicaciones con contratos, dependencias y flujos incompatibles. La nueva raíz del repositorio adopta una única aplicación full-stack con sus pruebas, configuración y documentación asociadas.

Los archivos DOCX originales se preservan en `docs/source/` con nombres legibles. Las versiones Markdown de `docs/source-analysis/` no reemplazan esos documentos: permiten enlazar requisitos, reglas y criterios de aceptación a la implementación.

## Validación esperada

La rama se considera correctamente migrada cuando los comandos siguientes se ejecutan desde la raíz:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm test:a11y
```

## Referencias

[1] [Pautas de diseño Impeccable](design-references/impeccable-notes.md)  
[2] [Inventario completo del repositorio](repository-inventory.md)  
[3] [Trazabilidad del Perfilador UCorp F1](pilot-f1-traceability.md)
