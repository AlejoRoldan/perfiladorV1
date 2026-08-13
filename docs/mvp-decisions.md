# Decisiones del MVP — Itti Talent Compass

## Propósito y alcance

Itti Talent Compass es un panel administrativo de demostración para People & Culture. Permite configurar y asignar evaluaciones, revisar perfiles de talento, explorar competencias, visualizar señales agregadas de talento y explicar la compatibilidad orientativa entre una persona y una oportunidad interna. Todos los datos, nombres, resultados y evidencias son sintéticos; el producto no emite ni ejecuta decisiones laborales automáticas.

## Alcance demostrable

| Dominio | Capacidades del MVP |
|---|---|
| Acceso | Selector de rol de demostración con interfaz administradora; se documenta su sustitución por OIDC/SAML corporativo. |
| Evaluaciones | Plantillas configurables, preguntas, escalas, asignación, experiencia de respuesta y cálculo orientativo. |
| Personas | Directorio, ficha 360°, competencias, historial, fortalezas y brechas. |
| Talento | Indicadores, radar, barras, mapa de calor, matriz con metodología y tabla alternativa. |
| Movilidad | Roles internos, compatibilidad explicable, requisitos faltantes y recomendación de preparación. |
| Gobierno | Configuración, señales de auditoría y exportaciones simuladas con aviso de permiso. |

## Exclusiones conscientes

No se conectarán servicios empresariales reales, no se almacenarán credenciales falsas, no se analizarán categorías personales sensibles y no se usarán resultados como única base para una decisión de contratación, promoción, sanción o exclusión. La autenticación, la persistencia completa, las integraciones con HRIS e IttiAcademy, y las exportaciones de archivos reales quedan preparadas como evolución posterior.

## Tema ITTI configurable

El sitio institucional público de ITTI presenta el logotipo en variantes claras y una dirección visual de alto contraste, con fondos oscuros y acentos verdes brillantes. El MVP toma esas señales como referencia visual, pero implementa todos los valores como tokens CSS editables; no presupone que constituyan un manual de marca autorizado. El logotipo, la paleta exacta, las fuentes, la iconografía y las reglas de uso oficiales siguen pendientes de validación por marca.

| Elemento | Decisión para el MVP | Pendiente de incorporación oficial |
|---|---|---|
| Logotipo | Marca textual de demostración y espacio reservado en navegación. | Archivo, variantes, área de seguridad y permiso de uso. |
| Color | Tokens semánticos configurables inspirados en el contraste oscuro y acento verde observables. | Valores oficiales, combinaciones permitidas y contrastes aprobados. |
| Tipografía | Sans serif de interfaz legible, intercambiable desde tokens. | Familia tipográfica, licencias, pesos y reglas tipográficas. |
| Componentes | Geometría sobria, foco visible y estados accesibles. | Biblioteca de componentes, iconografía y patrones corporativos. |

## Arquitectura y datos demo

La demostración utilizará una interfaz React y TypeScript con un catálogo de datos sintéticos tipados. El dominio se separará de la interfaz mediante tipos y funciones determinísticas de cálculo para evaluación, brecha y compatibilidad. El diseño queda preparado para que estos catálogos puedan sustituirse por procedimientos tipados y persistencia multiempresa sin reescribir los componentes.

El conjunto de prueba representará tres empresas, áreas, equipos, roles, competencias, instrumentos, colaboradores y oportunidades internas. Para preservar claridad durante la demostración, el directorio visible se centrará en una muestra de personas y las visualizaciones mostrarán agregados anonimizados.

## Navegación propuesta

El administrador llega a **Panorama** y puede continuar hacia **Colaboradores**, **Evaluaciones**, **Movilidad**, **Reportes** y **Configuración**. Los perfiles y oportunidades se abren en paneles de detalle conservando una ruta clara de retorno. Las acciones que requieren infraestructura posterior muestran un estado explícito de simulación, nunca un control inerte.

## Motor de evaluación explicable

El resultado se calcula de forma determinística: cada pregunta aporta una puntuación normalizada, cada competencia aplica su ponderación y el resultado se compara con el nivel esperado por rol. La brecha es la diferencia entre nivel esperado y nivel observado; la compatibilidad se compone de coincidencias, requisitos obligatorios, brechas e información faltante. Cada salida conserva fuente, fecha, confianza y una explicación legible.

## Riesgos principales y mitigaciones

| Riesgo | Mitigación del MVP |
|---|---|
| Interpretar una señal como veredicto laboral | Mostrar metodología, evidencia, confianza, datos faltantes y revisión humana requerida. |
| Uso de información personal real | Usar exclusivamente datos ficticios y minimizar los campos de la demostración. |
| Suplantar lineamientos de marca | Aplicar tokens configurables y señalar las aprobaciones de identidad pendientes. |
| Exposición entre empresas | Representar el tenant activo y dejar las reglas de aislamiento como contrato obligatorio para la integración de datos real. |

## Referencia visual pública

[1] [ITTI — Sitio institucional](https://www.itti.digital/)
