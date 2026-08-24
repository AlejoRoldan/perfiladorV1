# Sistema visual corporativo — Itti Talent Compass

## Propósito y adaptación

Esta guía registra la adopción del lenguaje visual definido en `DESIGN(2).md` para **Itti Talent Compass**. El documento de referencia describe una landing B2B; la plataforma es un panel operativo de People & Culture. Por ello se conservan sus principios visuales —modo oscuro, señales neon con roles semánticos, superficies translúcidas, tipografía y microinteracciones— sin trasladar patrones de landing que perjudicarían la lectura de tablas, formularios o diagnósticos.

> La interfaz es un cockpit de inteligencia de talento: debe hacer visibles la evidencia, la trazabilidad y el siguiente paso humano; no debe sugerir decisiones laborales automatizadas.

## Tokens corporativos

| Token | Valor OKLCH | Uso autorizado |
|---|---:|---|
| `--background` | `oklch(0.125 0.028 250)` | Fondo navy casi negro de la aplicación. |
| `--panel` | `oklch(0.19 0.038 252 / 0.78)` | Superficies glassmórficas principales. |
| `--panel-strong` | `oklch(0.235 0.042 252 / 0.82)` | Campos, controles y capas elevadas. |
| `--accent` | `oklch(0.90 0.20 154)` | Verde Itti: acción primaria, estado activo y éxito. |
| `--amber` | `oklch(0.84 0.18 195)` | Cian: contexto, inteligencia y foco informativo. |
| `--violet` | `oklch(0.68 0.28 300)` | Violeta: benchmark, expectativa y comparación. |
| `--danger` | `oklch(0.70 0.28 350)` | Rosa: errores y señales críticas; nunca como decoración. |
| `--muted` | `oklch(0.70 0.025 250)` | Texto secundario sobre fondos oscuros. |

La jerarquía cromática evita que los cuatro acentos compitan entre sí. El verde Itti es la única señal para acciones principales y estados de avance; cian aporta contexto; violeta solo diferencia comparativas; rosa expresa error o brecha crítica.

## Tipografía y superficies

**Urbanist** se aplica a títulos, métricas y puntos de decisión para crear una jerarquía directa. **Poppins** se aplica a lectura operativa, tablas, formularios y etiquetas, con espaciado de letra moderado para conservar claridad en interfaces densas.

Las tarjetas se construyen mediante fondo navy translúcido, borde blanco de baja opacidad, `backdrop-filter` y brillo de acento contenido. Las sombras negras planas no se usan como elevación de elementos interactivos. Los glows tienen opacidad baja y solo complementan el borde, el foco o un estado; no reemplazan texto, iconografía ni señalización semántica.

## Patrones aplicados

| Patrón | Aplicación en el panel |
|---|---|
| Navegación activa | Gradiente verde/cian, borde tenue y brillo discreto. |
| CTA primario | Botón pill con gradiente verde Itti–cian, texto navy y confirmación táctil al pulsar. |
| CTA secundario | Botón pill transparente con borde verde y brillo ligero al pasar el cursor. |
| Tarjetas y formularios | Glassmorphism con bordes translúcidos y jerarquía de fondo, sin sombras negras duras. |
| Perfilador F1 | Hero con malla verde/violeta, estados por color semántico y formularios de alto contraste. |
| Movimiento | Animaciones cortas en `transform` y `opacity`; el sistema respeta `prefers-reduced-motion`. |

## Criterios de accesibilidad

Los colores neon no se usan sobre fondos claros y los estados siempre conservan soporte textual, iconográfico o de borde. El foco visible utiliza un contorno verde/cian de alto contraste; los componentes interactivos mantienen comportamiento de teclado y estados deshabilitados distinguibles. El brillo ambiental queda por debajo de la prominencia visual del contenido y no contiene información exclusiva.

La verificación posterior al rediseño ejecutó `pnpm check`, `pnpm test` y `pnpm test:a11y`: TypeScript no reportó errores, las **27 pruebas** finalizaron correctamente y Axe no identificó infracciones en las **23 reglas** evaluadas. Las dos comprobaciones incompletas de Axe siguen requiriendo revisión humana, conforme al registro general de calidad.

## Límites deliberados

Los divisores gradiente, revelados por scroll y decoraciones de landing se adoptan solo cuando mejoran la orientación. En este panel, la navegación persistente, las tablas, los formularios y las alertas operativas tienen prioridad sobre una animación ornamental. No se introdujeron dependencias nuevas ni se modificó la lógica de evaluación, diagnóstico, trazabilidad o persistencia H6.
