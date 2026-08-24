# Evaluación de referencia — taste-skill

El repositorio público **taste-skill** se presenta como un marco de diseño frontend para agentes de IA. Su estructura expone tres habilidades diferenciadas — gusto visual, rediseño y completitud de entrega — junto con una biblioteca de ejemplos e investigación. Está publicado bajo licencia MIT. [1]

## Hallazgos iniciales

| Hallazgo | Relevancia para Itti Talent Compass |
|---|---|
| La habilidad de rediseño declara revisiones de tipografía, color, layout, interactividad, contenido, componentes, accesibilidad y código. | Útil como lista de control para endurecer los flujos de Perfilador F1 y configuración de evaluaciones. |
| La guía de versiones menciona esqueletos de animación para secciones fijas, paneles horizontales y revelado al desplazarse. | Los principios de movimiento pueden inspirar transiciones de paso y estados de sesión, pero no conviene adoptar scroll narrativo en un panel operativo. |
| La versión actual destaca reglas de consistencia de color, forma y tema, además de un protocolo de modo oscuro. | Aplicable para mantener la identidad ITTI sin mezclar patrones visuales o estados contradictorios. |
| El proyecto contiene ejemplos e investigación, no un catálogo de componentes React mantenido para consumo directo. | Se recomienda adoptar patrones, no instalarlo como dependencia ni copiar componentes de forma indiscriminada. |

> Este análisis es de referencia. No se ejecutó código ni se incorporó software de taste-skill en Itti Talent Compass.

## Recomendación priorizada de adopción

| Prioridad | Patrón a adoptar | Aplicación concreta en Itti Talent Compass | Valor | Riesgo y control |
|---|---|---|---|---|
| Alta | **Estados completos y feedback de acción** | Crear esqueletos contextuales para carga de perfiles, generación de sesiones y recomendaciones IA; usar errores en línea y confirmación persistente de acciones. | Reduce incertidumbre en tareas de People & Culture y refuerza los flujos H3–H6. | No añadir animación decorativa; mantener estados semánticos y accesibles. |
| Alta | **Respuesta física mínima en controles** | Aplicar hover, `:active` y foco visible consistentes a botones de aprobar, distribuir, guardar borrador y enviar autoevaluación. | Hace que acciones críticas parezcan inmediatas sin cambiar la lógica de negocio. | Limitar transiciones a 160–240 ms y solo `transform`/`opacity`; respetar reducción de movimiento. |
| Alta | **Divulgación progresiva en lugar de modales repetidos** | Usar panel lateral o secciones expandibles para editar una pregunta, revisar brechas y ver trazabilidad; conservar modales solo para confirmaciones irreversibles. | Mantiene contexto cuando Talent configura evaluaciones extensas. | Conservar rutas claras de cierre, foco y regreso; no ocultar campos requeridos. |
| Media | **Jerarquía numérica y densidad operativa** | Usar cifras tabulares para puntajes 1–4, tolerancia, avance y comparativas; limitar ancho de texto y alinear acciones de tarjetas. | Mejora exploración de dashboard y diagnóstico sin añadir componentes nuevos. | No sacrificar legibilidad por una estética editorial; validar contraste y tamaño en móvil. |
| Media | **Auditoría de coherencia visual** | Aplicar una revisión por pantalla de tipografía, único acento ITTI, escala de radios, estados vacíos y accesibilidad de teclado. | Evita que los nuevos módulos parezcan aplicaciones distintas. | Tratarla como checklist de QA, no como sustituto del manual de marca ITTI. |
| Baja | **Entrada escalonada y elevación sutil de grupos** | Añadir revelado discreto al mostrar resultados de diagnóstico o listas de recomendaciones, y feedback de selección en tarjetas no críticas. | Da continuidad perceptiva a resultados extensos. | Evitar scroll pinning, carruseles y efectos GSAP en una aplicación de operación diaria. |

## Qué no adoptar

No recomiendo instalar `taste-skill` como dependencia de runtime ni trasladar sus ejemplos de marketing, fondos decorativos, paneles con scroll horizontal, pinning de secciones, carruseles o animaciones vinculadas al desplazamiento. El repositorio funciona como una **guía de diseño y auditoría**, no como una biblioteca de componentes React. En un sistema operativo de People & Culture, la facilidad de escaneo, el foco visible, el control de movimiento y la continuidad de contexto son más valiosos que una narrativa visual espectacular.

## Orden sugerido de implementación

Primero conviene estandarizar los **estados de carga, error, vacío y éxito** de las acciones existentes. Después se puede consolidar la respuesta de botones, foco, atajos de teclado y edición progresiva dentro de la configuración de evaluaciones. Finalmente, se debe realizar una auditoría responsive de las métricas y del Perfilador F1; los efectos visuales de prioridad baja solo se justificarán si no alteran las tareas principales.

## Referencias

[1] [Leonxlnx/taste-skill — GitHub](https://github.com/Leonxlnx/taste-skill)
