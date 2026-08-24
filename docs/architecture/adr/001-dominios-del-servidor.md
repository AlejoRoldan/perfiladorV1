# 001 — Agrupar el servidor por dominios de negocio

## Estado

Aceptada.

## Contexto

La plataforma reúne campañas, instrumentos, pilotos, controles de acceso, recomendaciones de aprendizaje y exportaciones. Con los módulos en la raíz de `server/`, era posible encontrar cada archivo, pero la relación entre una regla de negocio y sus pruebas no era evidente para una persona nueva en el equipo.

## Decisión

La lógica se agrupa bajo `server/domains/` usando los dominios `access`, `campaigns`, `learning`, `openapi`, `pilot` y `reporting`. Las pruebas se reubican junto al módulo que verifican. El router tRPC conserva el papel de composición de contratos y autorización de entrada, mientras que `server/_core/` sigue reservado para infraestructura de plataforma.

## Consecuencias

El árbol del servidor se vuelve navegable por responsabilidad y las revisiones pueden concentrarse en un dominio. Los imports relativos cambian al mover archivos, por lo que cada reorganización debe pasar `pnpm check` y la suite Vitest. Esta decisión no modifica tablas, procedimientos expuestos ni reglas de autorización.

## Validación

La reorganización se valida con el comprobador TypeScript, pruebas de dominio y el arranque del servidor de desarrollo.
