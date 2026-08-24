# Features de la interfaz

Cada subcarpeta representa un flujo de trabajo reconocible para una persona usuaria. Esta organización permite que una pantalla, sus estilos y sus reglas de presentación evolucionen juntas sin contaminar componentes reutilizables.

| Feature | Qué contiene | Casos de uso principales |
|---|---|---|
| `assessments/` | Configuración y operación del ciclo de evaluación. | Construir instrumentos, aprobar versiones, crear campañas, asignar, responder, diagnosticar y revisar resultados. |
| `profiling/` | Experiencia de Perfilador y trabajo individual. | Inicio, sesiones, reporte del colaborador, matriz de competencias y progreso local. |

## Dónde colocar código nuevo

Una vista exclusiva de un flujo debe vivir en la feature correspondiente. Un componente visual que pueda usarse en más de una feature debe ir en `client/src/components/`. Una regla pura, sin estado de React ni llamadas de red, pertenece a `client/src/lib/` y debe tener prueba unitaria cuando afecte cálculos o decisiones de interfaz.

Los datos del directorio `client/src/data/` son sintéticos y sirven solamente para demostración. Nunca use ese directorio para registros de participantes, resultados, diagnósticos ni exportaciones reales.
