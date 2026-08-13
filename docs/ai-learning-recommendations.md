# Recomendaciones de capacitación asistidas por IA

## Propósito y límite de uso

La función transforma señales de aprendizaje ya visibles en la ficha 360° en una propuesta de ruta de capacitación. Su objetivo es preparar una conversación de desarrollo entre la persona, su líder y People & Culture; **no califica personas, no predice desempeño y no toma decisiones de promoción, movilidad, compensación o permanencia**.

> La ruta es una sugerencia educativa. People & Culture debe revisarla, contextualizarla y acordarla con la persona antes de asignar cualquier aprendizaje.

## Datos mínimos enviados al servicio de IA

| Señal permitida | Uso en la recomendación |
|---|---|
| Rol y seniority generalizados | Ajustar el nivel y el contexto de las actividades. |
| Intereses de desarrollo declarados | Priorizar temas relevantes para la persona. |
| Competencias observadas y nivel esperado | Identificar hasta tres brechas de aprendizaje concretas. |
| Desempeño y potencial en bandas | Ajustar el ritmo de la ruta, sin emitir juicios laborales. |
| Conteo de evidencias y estado de evaluación | Indicar la confianza y pedir revisión cuando corresponda. |

No se envían a la IA nombres, iniciales, correo, ubicación, empresa, equipo, antigüedad exacta, respuestas de evaluación, comentarios libres, identificadores internos ni atributos sensibles. En la demo, los datos son sintéticos.

## Salida estructurada

La respuesta se valida con un esquema estricto antes de llegar a la interfaz. Debe contener una prioridad de desarrollo, una breve explicación vinculada a brechas observables, entre dos y tres actividades de aprendizaje, tiempo estimado, una pregunta para conversación y un recordatorio de revisión humana. Las actividades se formulan como modalidades genéricas —por ejemplo, curso guiado, práctica aplicada, acompañamiento o lectura— hasta integrar un catálogo autorizado de IttiAcademy.

## Salvaguardas operativas

La llamada se realiza únicamente en el servidor y con credenciales gestionadas por el entorno. La interfaz enseña que la sugerencia fue generada con señales mínimas, comunica sus límites y permite volver a solicitarla; no persiste la respuesta en esta fase. La indisponibilidad del modelo muestra un estado de error claro, sin fabricar una recomendación ni ocultar el fallo.

Antes de producción deben incorporarse autenticación corporativa, RBAC de servidor, consentimiento aplicable, catálogo de aprendizaje aprobado, auditoría de solicitudes sin contenido sensible, límites de uso, evaluación de sesgo y proceso de apelación o corrección.
