# Validación de calidad — Itti Talent Compass

**Fecha de revisión:** 13 de agosto de 2026.  
**Alcance:** MVP de demostración con datos sintéticos para People & Culture, incluida la recomendación de capacitación asistida y el Perfilador UCorp F1.

## Resultado de verificación

| Área | Validación | Resultado |
|---|---|---|
| Tipado | `pnpm check` | Correcto, sin errores de TypeScript. |
| Pruebas | `pnpm test` | Correcto: 7 archivos y 22 pruebas superadas. |
| Motor de talento | Normalización, ponderación, brechas y compatibilidad | Cubierto por pruebas unitarias determinísticas. |
| Datos demo | Conteo y campos esenciales del catálogo sintético | Cubierto por prueba unitaria. |
| Escritorio | Captura de pantalla a 1280 × 720 | Confirmada la jerarquía, lectura de gráficos y trazabilidad. |
| Móvil | Captura de pantalla a 390 × 844 | Confirmada la adaptación de tarjetas, gráficos y mapa de calor. |
| Accesibilidad base | Revisión manual de semántica y navegación | Aprobada para el alcance de la demo; ver detalle. |
| Auditoría automatizada | `pnpm test:a11y` con Axe (WCAG 2 A, AA y 2.1 AA) | Correcto: 23 reglas superadas, 0 infracciones y 2 revisiones manuales pendientes. |
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

Además, las respuestas parciales se guardan en `localStorage` mediante un snapshot versionado y aislado por sesión y colaborador demo. Al recargar, la vista recupera el estado de la sesión, las dimensiones y las respuestas guardadas; los snapshots corruptos o ajenos al contexto se descartan. El envío elimina el borrador local antes de mostrar el cierre inmutable. La cobertura automatizada se encuentra en `assessmentProgressStore.test.ts`; la ejecución más reciente completó **27 pruebas** y la comprobación de tipos sin errores.

La validación visual específica de H6 se completó el 13 de agosto de 2026 en escritorio: se generó y distribuyó una sesión, se respondió parcialmente la primera pregunta con nivel 4, se recargó la página y se confirmó el aviso de **“Progreso recuperado desde este navegador de demo”**, la sesión activa y la respuesta restaurada. La evidencia se conserva como `h6-progress-restored.png` en los activos de verificación del proyecto.

## Patrones de interactividad adoptados

El Perfilador F1 incorpora estados de carga con comunicación no bloqueante y placeholders animados durante la generación de sesiones; una sección nativa `details/summary` para consultar trazabilidad sin competir con la tarea principal; semántica de pestañas; foco visible reforzado; feedback de pulsación; y respeto por `prefers-reduced-motion`. Los controles de respuesta exponen su estado y quedan bloqueados tras el envío de la autoevaluación.

La revisión visual en escritorio confirmó que la jerarquía permanece compacta: la trazabilidad inicia cerrada, los siete pasos H2–H8 preservan un orden inequívoco y la configuración conserva sus dos módulos paralelos sin competir con las acciones prioritarias.

La revisión responsive a 390 × 844 confirmó que el panel principal mantiene la lectura de métricas y la divulgación contextual en una sola columna. En el Perfilador F1, los pasos se reordenan en una grilla de dos columnas, los selectores se apilan y los módulos de valores y competencias conservan controles táctiles de tamaño legible.

En People & Culture se añadió un estado vacío verificable para el directorio de colaboradores, accesible mediante una búsqueda sin resultados y con recuperación inmediata. La operación de recomendación asistida conserva sus estados de carga, error, reintento y resultado, mientras que el Perfilador F1 expone carga, fallback, aprobación y bloqueo posterior al envío.

El constructor de evaluaciones mejorado se verificó de forma directa en escritorio y móvil mediante `/?view=builder`. En escritorio preserva la navegación secuencial, la selección de competencias y las acciones de borrador/publicación; en móvil, los siete pasos permanecen visibles, las competencias mantienen una grilla legible y las acciones de navegación conservan una separación táctil adecuada.

Las operaciones de guardar y publicar exponen un estado de proceso, éxito o revisión requerida mediante regiones `status` y `alert`, sin sustituir el contenido de trabajo ni interrumpir la navegación. La validación de borrador requiere al menos una competencia y una pregunta antes de aceptar una operación.

El perfil 360° se verificó mediante `/?view=profile` en escritorio y móvil. Las acciones de solicitar revisión y preparar comparación aparecen como operaciones separadas de la lectura del perfil, comunican proceso, éxito o recuperación y habilitan el acceso a movilidad solo después de preparar la comparación. En móvil, los controles se apilan antes de los indicadores y mantienen una separación táctil clara; la lectura de competencias, evidencia y capacitación permanece en una sola columna.

## Integración de la matriz de Engineering

La integración parte de `CopiadeMatrixSkills.xlsx`, fuente compartida por People & Culture y analizada en [`source-analysis/itti-engineering-matrix-analysis.md`](source-analysis/itti-engineering-matrix-analysis.md). La plataforma presenta cuatro competencias oficiales, los perfiles Jr Engineer, Ssr Engineer, Sr Engineer, Technical Lead y Engineering Manager, anclas conductuales por perfil y tres tipos derivados de evaluación: autoevaluación, evaluación de manager y conversación de calibración. La escala se normaliza explícitamente a 1–4 para operar con F1; no es una escala numérica impuesta por el archivo fuente ni una regla de promoción.

La comprobación más reciente completó **30 pruebas unitarias** y TypeScript sin errores. La captura de escritorio de `/?view=pilot` confirmó que el selector de perfil, las anclas y la separación entre valores demo y competencias oficiales son legibles. La captura de `/?view=builder` confirmó que el constructor permite elegir el perfil y tipo de evaluación de Engineering, mantiene la escala 1–4 y presenta la advertencia de revisión humana sin superposición visual.

En móvil (390 × 844), el hero, el selector de historias y el encabezado de configuración del Perfilador se apilan sin desplazamiento horizontal. El constructor mantiene el paso activo, la selección de perfil y el selector de tipo de evaluación en una sola columna con etiquetas visibles; el detalle de competencias continúa debajo de dichos controles.

## Campañas y avisos internos

La funcionalidad de campañas se verificó con **38 pruebas unitarias** y TypeScript sin errores. La cobertura del dominio valida duración mínima, fechas inválidas, transición programada/activa/cerrada, suspensión, hitos de apertura/mitad/cierre y claves idempotentes. El handler global cubre solicitudes no cron, tareas huérfanas y el `taskUid` de la tarea registrada. Una ejecución E2E persistente creó la campaña `30001` con dos participantes, emitió dos avisos de apertura, confirmó cero duplicados en el reintento, conservó los dos avisos en el historial y confirmó cero emisiones después de pausarla y cerrarla. La tarea gestionada `itti-campaign-reminders` quedó activa con callback `POST /api/scheduled/campaign-reminders` y cadencia horaria.

**Evidencia de ejecución real:** `taskUid` `KmTrjE8yEqTYhdo62EDL9A`; ejecución finalizada el **18 de agosto de 2026 a las 23:07:22 UTC**; estado `success`; **HTTP 200**; duración 3.932 ms; respuesta `{"ok":true,"processed":0,"emitted":0,"results":[]}`. El resultado esperado con cero campañas activas pendientes es `processed: 0` y `emitted: 0`. La interfaz se revisó usando una selección visual de participantes sin persistir datos de prueba: confirmó 12 participantes seleccionados, dos campos de fecha, la cadencia visible de avisos internos y el estado vacío cargado desde la API de campañas (HTTP 200, arreglo vacío).

## Criterio de salida

El MVP está listo para revisión funcional y visual con el equipo. La siguiente fase de producto deberá priorizar autenticación corporativa, autorización del lado del servidor, catálogo de aprendizaje aprobado, persistencia, auditoría inmutable, aislamiento por tenant y las integraciones de HRIS, IttiAcademy y Data Lake definidas en el README.
