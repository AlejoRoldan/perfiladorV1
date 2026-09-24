# Registro de decisiones técnicas

Este registro deja visibles las decisiones que afectan más de una carpeta. No pretende congelar el diseño: documenta por qué el MVP funciona de cierta forma y qué condición debería motivar su revisión.

| Decisión | Estado | Motivo | Señal para revisarla |
|---|---|---|---|
| Mantener tres proyectos Node separados. | Aceptada para el MVP. | Reduce la complejidad inicial y permite ejecutar frontend, backend y agente de forma independiente. | Compartir contratos o publicar paquetes internos de forma frecuente. |
| Usar reglas determinísticas para el diagnóstico. | Aceptada. | El resultado es trazable, reproducible y fácil de probar. | Reglas configurables por organización o necesidad de auditoría avanzada. |
| Usar OpenAI solo desde el backend. | Aceptada. | Protege la clave del navegador y centraliza el manejo de errores. | Incorporar una capa de proveedor o gateway corporativo. |
| Mantener el historial solo en cliente. | Temporal. | Evita diseñar almacenamiento de datos personales antes de tener identidad y políticas de retención. | Requerir continuidad entre sesiones o reportes históricos. |
| Validar HTTP con Zod. | Aceptada. | Hace explícitos rangos, roles y límites antes de llegar al dominio. | Generar contratos compartidos u OpenAPI a partir de esquemas. |
| Usar `MockEventPublisher` en desarrollo. | Temporal. | Permite observar eventos sin una dependencia de mensajería. | Integración con otros sistemas o necesidad de procesamiento asíncrono. |

Las decisiones nuevas deben describir el contexto, la alternativa elegida, sus consecuencias y una señal concreta que justifique revisarla.

## Referencias

[1]: https://adr.github.io/ "Architecture Decision Records"
