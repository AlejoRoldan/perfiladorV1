# Perfilador de Competencias — Grupo Vázquez

El **Perfilador de Competencias** es un prototipo funcional que transforma las respuestas de un cuestionario breve en un diagnóstico por competencias. El diagnóstico combina un motor de reglas determinístico con una conversación de acompañamiento generada por un modelo de lenguaje. La intención es que la persona no reciba solo una puntuación, sino un punto de partida claro para su desarrollo.

> El repositorio contiene un **MVP local de Iteración 3**. No incluye autenticación, persistencia, control de acceso ni una infraestructura de despliegue; por tanto, no debe usarse todavía para tratar información real de colaboradores en producción.

## Estado funcional

La Iteración 1 implementó `ScoreCompetencia` con reglas reproducibles. La Iteración 2 añadió `NecesidadDetectada` y un agente conversacional. La Iteración 3 incorporó una interfaz React y una API Express que conectan el cuestionario, los resultados y el chat.

El flujo actual es el siguiente: la persona responde cinco preguntas con valores de 1 a 5; el backend calcula la puntuación por competencia; se comparan los resultados con el perfil esperado para el rol; finalmente, el agente recibe las necesidades priorizadas y abre una conversación breve en español.

## Arquitectura y principios

El backend sigue una variante ligera de **Clean Architecture**. El dominio contiene las reglas puras de scoring y detección de brechas. La capa de aplicación orquesta casos de uso y depende de puertos. La infraestructura implementa los detalles técnicos, como el publicador de eventos para el entorno de desarrollo. Express actúa como adaptador HTTP y no contiene reglas de negocio.

| Principio | Aplicación en el proyecto |
|---|---|
| **Responsabilidad única** | `ScoringEngine`, `NeedsAnalyzer`, la capa HTTP y el cliente de API del frontend tienen responsabilidades separadas. |
| **Abierto/cerrado** | La matriz, los perfiles esperados y los adaptadores se pueden extender sin reescribir el núcleo del scoring. |
| **Sustitución de Liskov** | Los publicadores de eventos pueden intercambiarse al respetar el puerto de aplicación. |
| **Segregación de interfaces** | Los contratos de dominio separan entradas, eventos, perfiles y necesidades. |
| **Inversión de dependencias** | Los casos de uso dependen de interfaces, no de Express, OpenAI ni de una infraestructura específica. |

## Stack tecnológico

| Área | Tecnologías |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS y Recharts |
| API | Node.js, TypeScript, Express, CORS, Zod y dotenv |
| Motor de reglas | TypeScript puro, Jest y ts-jest |
| Agente | SDK de OpenAI, TypeScript y configuración por variables de entorno |
| Calidad | Pruebas unitarias y de contrato con Jest; validación de compilación con TypeScript |

## Estructura del repositorio

```text
perfiladorV1/
├── frontend/                  # Experiencia web: bienvenida, cuestionario, resultados y chat
├── backend/                   # API HTTP, casos de uso y motor determinístico
│   └── src/
│       ├── domain/            # Reglas y contratos independientes de frameworks
│       ├── application/       # Casos de uso y puertos
│       ├── infrastructure/    # Adaptadores técnicos del entorno de desarrollo
│       └── presentation/http/ # Validación de solicitudes HTTP
├── agent/                     # Paquete aislado del agente conversacional
└── docs/                      # Guías operativas, arquitectura y decisiones
    ├── frontend/
    ├── backend/
    ├── agent/
    └── decisions/
```

El índice de la documentación está en [`docs/README.md`](docs/README.md). Cada área tiene una guía independiente para evitar mezclar instrucciones de interfaz, API y modelo de lenguaje.

## Inicio rápido en Windows con PowerShell

Antes de empezar, instala **Git** y una versión vigente de **Node.js LTS**. Abre PowerShell y verifica las herramientas:

```powershell
node -v
npm -v
git --version
```

Desde una carpeta conocida, por ejemplo tu carpeta de usuario, clona o actualiza el repositorio. Estos comandos evitan depender de una ruta supuesta, que fue la causa típica del error de “no existe `package.json`”.

```powershell
Set-Location $HOME

if (-not (Test-Path .\perfiladorV1)) {
  git clone https://github.com/AlejoRoldan/perfiladorV1.git
}

Set-Location .\perfiladorV1
git pull origin main
```

Abre una primera ventana de PowerShell para el backend. Crea el archivo local de configuración una única vez, edítalo y agrega tu clave **solo en ese archivo local**. Nunca la pegues en un chat, commit o captura.

```powershell
Set-Location $HOME\perfiladorV1\backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
npm ci
npm run dev
```

En `.env`, completa `OPENAI_API_KEY=` con tu propia clave y conserva `OPENAI_MODEL=gpt-5-mini`, salvo que tu cuenta tenga habilitado otro modelo compatible. El backend quedará disponible en `http://localhost:3001`.

Abre una **segunda** ventana de PowerShell para el frontend:

```powershell
Set-Location $HOME\perfiladorV1\frontend
npm ci
npm run dev
```

Vite imprimirá una dirección local; normalmente es `http://localhost:5173`. Ábrela en el navegador. El frontend redirige automáticamente las solicitudes `/api` al backend local.

> En PowerShell no uses la sintaxis de Linux `OPENAI_API_KEY=valor comando`. La opción recomendada es guardar la clave en `backend/.env`. Para una prueba temporal, usa `$env:OPENAI_API_KEY = "valor"` en la misma ventana antes de ejecutar `npm run dev`.

Las instrucciones completas para Windows, macOS y Linux, junto con soluciones a errores frecuentes, están en [`docs/getting-started.md`](docs/getting-started.md).

## Ejecución en macOS y Linux

En dos terminales separadas, ejecuta los mismos procesos desde las carpetas correctas:

```bash
# Terminal 1: API
cd ~/perfiladorV1/backend
cp -n .env.example .env
npm ci
npm run dev

# Terminal 2: interfaz
cd ~/perfiladorV1/frontend
npm ci
npm run dev
```

Edita `backend/.env` antes de iniciar el backend para agregar `OPENAI_API_KEY`. La variable se carga mediante `dotenv`; no hace falta anteponerla al comando.

## Contratos HTTP principales

| Método y ruta | Propósito | Protección actual |
|---|---|---|
| `GET /api/health` | Confirma que la API está activa e indica si el agente está configurado. | No expone secretos. |
| `POST /api/diagnostico` | Valida cinco respuestas, calcula scores y detecta necesidades. | Rol permitido, preguntas únicas y valores enteros entre 1 y 5. |
| `POST /api/agent/chat` | Genera una respuesta a partir del contexto validado. | Historial limitado a 20 mensajes, mensaje limitado a 1.000 caracteres y error claro si falta la clave. |

Consulta los esquemas y ejemplos de solicitudes en [`docs/backend/README.md`](docs/backend/README.md).

## Verificación local

Ejecuta estas órdenes después de instalar las dependencias:

```bash
cd backend && npm test && npm run build
cd ../agent && npm test && npm run build
cd ../frontend && npm run build && npm run lint
```

El comando `build` valida TypeScript sin generar artefactos para backend y agent. En frontend, crea el paquete de producción en `frontend/dist/`, que está ignorado por Git.

## Seguridad y límites del MVP

La API valida la forma y el tamaño de las solicitudes, limita el cuerpo HTTP a 32 KB y nunca devuelve la clave de OpenAI. Los archivos `.env` están ignorados por Git y se proporcionan solo plantillas `.env.example` sin secretos. Aun así, faltan controles necesarios para producción: autenticación, autorización por rol, cifrado y persistencia segura, rate limiting, trazabilidad, gestión centralizada de secretos y una política de retención de datos.

El agente se usa como una guía de desarrollo y no debe tomar decisiones laborales, evaluar desempeño definitivo ni manejar datos personales sensibles. El historial de chat se mantiene únicamente en el navegador durante la sesión actual y se pierde al recargar la página.

## Próximos pasos recomendados

La siguiente iteración debería extraer los contratos compartidos a `packages/contracts`, sustituir el publicador mock por una cola o servicio de eventos, persistir diagnósticos bajo controles de acceso y añadir pruebas de integración HTTP. Antes de publicar el sistema, conviene incorporar autenticación, rate limiting, observabilidad y una revisión de privacidad con las áreas responsables.

## Referencias

[1]: https://nodejs.org/ "Node.js documentation"
[2]: https://vite.dev/guide/ "Vite guide"
[3]: https://platform.openai.com/docs/ "OpenAI API documentation"
[4]: https://zod.dev/ "Zod documentation"
