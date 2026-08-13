# Validación de calidad — Itti Talent Compass

**Fecha de revisión:** 13 de agosto de 2026.  
**Alcance:** MVP de demostración con datos sintéticos para People & Culture, incluida la recomendación de capacitación asistida y el Perfilador UCorp F1.

## Resultado de verificación

| Área | Validación | Resultado |
|---|---|---|
| Tipado | `pnpm check` | Correcto, sin errores de TypeScript. |
| Pruebas | `pnpm test` | Correcto: 6 archivos y 19 pruebas superadas. |
| Motor de talento | Normalización, ponderación, brechas y compatibilidad | Cubierto por pruebas unitarias determinísticas. |
| Datos demo | Conteo y campos esenciales del catálogo sintético | Cubierto por prueba unitaria. |
| Escritorio | Captura de pantalla a 1280 × 720 | Confirmada la jerarquía, lectura de gráficos y trazabilidad. |
| Móvil | Captura de pantalla a 390 × 844 | Confirmada la adaptación de tarjetas, gráficos y mapa de calor. |
| Accesibilidad base | Revisión manual de semántica y navegación | Aprobada para el alcance de la demo; ver detalle. |
| Auditoría automatizada | `pnpm test:a11y` con Axe (WCAG 2 A, AA y 2.1 AA) | Correcto: 22 reglas superadas, 0 infracciones y 2 revisiones manuales pendientes. |
| Recomendación asistida | Llamada tRPC de extremo a extremo con señales sintéticas | Correcto: devolvió una ruta JSON estructurada y validada. |
| Perfilador UCorp F1 | Validación de dominio, sesión, HITL, autoevaluación, diagnóstico y OpenAPI | Correcto: 9 pruebas específicas; contrato publicado en `/api/v1/openapi.json`. |
| Perfilador F1 — escritorio | Captura de configuración H2 a 1280 × 900 | Correcto: jerarquía, controles duales y regla H2 legibles. |
| Perfilador F1 — móvil | Captura de configuración H2 a 390 × 844 | Correcto: formularios y módulos se apilan; se ajustará el selector de pasos para hacer visibles H6–H8 sin desplazamiento horizontal. |

## Controles de accesibilidad revisados

La interfaz usa controles nativos de botón, entrada, selección, área de texto, radio y tabla. Las búsquedas, las preguntas, los accesos de fila y los interruptores tienen etiquetas o nombres accesibles. Los controles que expanden contenido comunican su estado mediante `aria-expanded`; los gráficos de radar y barras proporcionan una alternativa tabular focalizable y navegable con teclado.

Los elementos interactivos conservan un anillo de foco visible y la hoja de estilos reduce las animaciones no esenciales cuando el sistema operativo indica una preferencia de movimiento reducido. El mapa de calor está construido como tabla con cabeceras de fila y columna, y expone cada valor con una etiqueta descriptiva.

La auditoría automatizada identificó inicialmente una restricción de zoom en la etiqueta `viewport`. Se eliminó `maximum-scale=1` y la nueva ejecución de Axe confirmó **0 infracciones** para las reglas seleccionadas. Las dos verificaciones marcadas como incompletas por la herramienta requieren criterio humano, como es habitual para aspectos visuales y de significado contextual.

> Esta revisión es una validación de interfaz para la demostración. Antes de producción, conviene complementar con pruebas con lector de pantalla, contraste contrastado contra el manual de marca oficial y recorridos con usuarios de People & Culture.

## Restricciones comprobadas

El selector de rol de demo produce rutas y acciones restringidas visibles. Los roles de Líder de equipo y Colaborador no pueden abrir las vistas de gobierno; cuando una vista de reportes está disponible sin ser administrador, la acción de exportar queda deshabilitada y una explicación señala el permiso requerido. Esto modela el contrato de experiencia, no reemplaza el RBAC de servidor que deberá existir con autenticación corporativa real.

## Controles de la recomendación asistida

El procedimiento se ejecuta en servidor y valida tanto el conjunto mínimo de señales de entrada como la salida JSON estructurada. Una prueba verifica que los identificadores personales no pertenezcan al contrato y otra comprueba que la salida contenga únicamente actividades educativas y revisión humana. La comprobación de extremo a extremo usó datos sintéticos y obtuvo una ruta válida.

La interfaz comunica qué tipo de señal se analiza, incorpora estados de carga, fallo y reintento, y no muestra una alternativa prefabricada si la generación falla. La recomendación se trata como una sugerencia educativa y no se guarda en esta versión.

## Controles del Perfilador UCorp F1

El piloto valida la normalización de respuestas, los casos límite de la tolerancia de 0,12 puntos, la composición de 5, 10 y 15 preguntas según extensión, la aprobación con flujos y rúbricas obligatorias y la separación de resultados por flujo. El motor excluye del diagnóstico los flujos no seleccionados para una sesión, de modo que no se presenten como brechas inexistentes.

La ruta `/api/v1/openapi.json` se verificó desde el servidor de desarrollo. Describe las operaciones del piloto y declara el esquema JWT como preparación futura, sin presentarlo como protección activa en este alcance standalone.

La validación final de la demo ejecutó `pnpm check`, `pnpm test` y `pnpm test:a11y`. El resultado fue correcto: compilación sin errores, seis archivos de prueba con diecinueve casos superados y Axe sin infracciones en las veintidós reglas evaluadas. Las dos comprobaciones incompletas de Axe requieren revisión humana, como se documenta en esta guía.

La autoevaluación H6 ahora congela las respuestas en el momento del envío y sustituye los controles por la confirmación de `AssessmentSubmitted`; una prueba unitaria adicional verifica el bloqueo del progreso posterior al envío. La interfaz y el motor comparten la misma transición de cierre del envío.

## Criterio de salida

El MVP está listo para revisión funcional y visual con el equipo. La siguiente fase de producto deberá priorizar autenticación corporativa, autorización del lado del servidor, catálogo de aprendizaje aprobado, persistencia, auditoría inmutable, aislamiento por tenant y las integraciones de HRIS, IttiAcademy y Data Lake definidas en el README.
