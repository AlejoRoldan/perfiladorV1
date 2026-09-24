# Documentación del Perfilador

Esta carpeta separa la documentación por responsabilidad. La idea es que cada persona pueda encontrar la guía que necesita sin recorrer el código completo: la interfaz para quien trabaja en experiencia de usuario, la API para quien mantiene reglas y endpoints, y el agente para quien ajusta la conversación.

| Documento | Contenido |
|---|---|
| [Guía de inicio](getting-started.md) | Requisitos, instalación en Windows, macOS y Linux, configuración local y solución de problemas. |
| [Arquitectura](architecture.md) | Límites entre capas, flujo de datos, SOLID y decisiones de integración. |
| [Frontend](frontend/README.md) | Vistas, estado de la experiencia y desarrollo de la interfaz. |
| [Backend](backend/README.md) | Casos de uso, endpoints, validación HTTP y pruebas. |
| [Agente](agent/README.md) | Alcance del paquete conversacional, modelo y límites de uso. |
| [Decisiones](decisions/README.md) | Registro inicial de decisiones técnicas y criterios para cambios futuros. |

La guía de inicio es el punto de partida para ejecutar el producto. La arquitectura debe revisarse antes de realizar cambios que atraviesen más de una carpeta.

## Referencias

[1]: https://www.typescriptlang.org/docs/ "TypeScript documentation"
[2]: https://expressjs.com/ "Express documentation"
