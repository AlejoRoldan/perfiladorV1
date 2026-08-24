# Mockup standalone definitivo del Perfilador como fuente de verdad

## Fuente y alcance

Este documento resume el archivo definitivo entregado por el usuario: `Mockup_Agente_Perfilador_UCorp_Standalone.html`. A partir de este incremento, ese mockup rige la **arquitectura de experiencia, nomenclatura, secuencia de pantallas, jerarquía de contenido y lenguaje visible** del Perfilador UCorp.

Las reglas de negocio ya verificadas del piloto F1 se conservan cuando no exista una contradicción explícita: escala 1–4, tolerancia de 0,12, respuestas inmutables tras envío, revisión humana, diagnóstico separado por flujo y trazabilidad de fuente.

La pantalla de acceso del mockup se trata como una referencia futura. La decisión aprobada de excluir H1 mantiene esta demo sin autenticación ni control de permisos real.

## Recorrido definitivo

| Orden | Vista | Responsable | Regla central |
|---:|---|---|---|
| 1 | Inicio / Diagnósticos | Talento | Resumen de sesiones, borradores y diagnósticos con CTA de crear sesión. |
| 2 | Configuración integrada | Talento | Valores organizacionales, matriz de competencias y contexto del squad antes de crear sesiones. |
| 3 | Sesiones | Talento | Pipeline visible: borrador → generando → en revisión → distribuida → completada → vencida. |
| 4 | Crear sesión | Talento | Propósito, participantes, instrumento y confirmación en cuatro bloques. |
| 5 | Aprobar borrador | Talento | Cuestionario revisable; edición, regeneración y aprobación antes de distribuir. |
| 6 | Autoevaluación | Colaborador | Bienvenida de desarrollo, progreso, preguntas obligatorias y envío definitivo. |
| 7 | Reporte propio | Colaborador | Desarrollo personal, fortalezas, siguiente nivel y prácticas; sin convertirlo en revisión de desempeño. |
| 8 | Diagnóstico de talento | Talento | Score, brechas, cobertura, radar, barras, detalle y resumen textual por persona. |

## Reglas de interfaz que deben aplicarse

1. El área de Talento usa un **shell con sidebar de flujo** y pie persistente de anterior/continuar; el recorrido no debe depender de pestañas técnicas expuestas.
2. El área del colaborador es un **shell independiente**, con cabecera compacta, barra de progreso, tipografía y controles más grandes, y un cierre de desarrollo seguro.
3. La creación de sesión usa cuatro bloques ordenados: **propósito**, **participantes**, **instrumento** y **confirmación**.
4. La configuración muestra valores y competencias como módulos diferenciados. Debe indicar la procedencia de la matriz y el contexto de área, rol, seniority, track y squad.
5. Las sesiones deben expresar sus estados en lenguaje de pipeline. Los estados técnicos conservan su semántica de dominio bajo las etiquetas visibles del mockup.
6. El diagnóstico debe enfatizar `gap = esperado − real`, dimensiones evaluadas, cobertura, radar, barras, detalle de brechas y recomendaciones accionables.
7. Los colores semánticos quedan establecidos: verde para acción/confirmación, cian para referencia o esperado, naranja para brecha, rojo para riesgo y violeta para comparación secundaria.
8. Deben respetarse foco visible, contraste, navegación por teclado y `prefers-reduced-motion`.

## Conciliación con la matriz oficial de People & Culture

El mockup menciona una matriz de Ingeniería v5 con 19 habilidades y 9 roles de carrera. La fuente oficial incorporada al proyecto contiene actualmente 4 competencias trazables y 5 perfiles: **Jr Engineer**, **Ssr Engineer**, **Sr Engineer**, **Technical Lead** y **Engineering Manager**.

Para no inventar datos de People & Culture, la plataforma conservará la matriz oficial como catálogo evaluable. El mockup se usa como fuente de verdad de experiencia y estructura. Los elementos no respaldados por la matriz oficial se expresarán como contexto o capacidad futura, nunca como competencias o niveles oficialmente evaluados.

## Cambios de prioridad

1. Reemplazar la navegación principal por pestañas técnicas del Perfilador por el shell secuencial Talento/Colaborador del mockup.
2. Separar con claridad la experiencia administrativa y la autoevaluación, usando el copy de desarrollo seguro del mockup.
3. Sacar el contrato OpenAPI del recorrido principal y mantenerlo como una referencia técnica secundaria.
4. Preservar el motor F1, persistencia H6, revisión HITL, diagnóstico y catálogo oficial de Engineering detrás de la experiencia actualizada.
