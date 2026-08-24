# Automatizaciones de desarrollo

Los scripts de esta carpeta ejecutan verificaciones locales que complementan las pruebas TypeScript y Vitest.

| Script | Ejecución | Finalidad |
|---|---|---|
| `run-axe.mjs` | `pnpm test:a11y` | Revisa accesibilidad de la vista inicial con Axe. |

Todo script nuevo debe ser reproducible, no depender de datos personales y documentar su comando de ejecución en esta página y, si corresponde, en `package.json`.
