# Registro de decisiones de arquitectura

Un **ADR** registra una decisión que condiciona la evolución del sistema. Su propósito no es burocrático: permite entender por qué una solución existe, qué alternativas se descartaron y qué consecuencias debe asumir el equipo.

## Cuándo crear un ADR

Genere un ADR cuando el cambio afecte límites de datos, estrategia de autenticación, integración externa, modelo de persistencia, cálculo de diagnósticos, exportaciones, observabilidad o una convención que vaya a sostener múltiples entregas.

## Plantilla

```md
# NNN — Título de la decisión

## Estado

Propuesta | Aceptada | Reemplazada | Retirada

## Contexto

Qué problema se necesita resolver y qué restricciones existen.

## Decisión

Qué se acordó implementar y por qué.

## Consecuencias

Beneficios, costes, riesgos, compatibilidad y trabajo posterior.

## Validación

Pruebas, revisión o evidencia que confirma la decisión.
```

Use un número secuencial de tres cifras y nombre el archivo con `NNN-tema-en-kebab-case.md`. Cuando un ADR reemplace otro, enlace ambos documentos.

## Decisiones registradas

| ADR | Estado | Resumen |
|---|---|---|
| [`001-dominios-del-servidor.md`](001-dominios-del-servidor.md) | Aceptada | Organiza la lógica de servidor y sus pruebas por dominio de negocio. |
