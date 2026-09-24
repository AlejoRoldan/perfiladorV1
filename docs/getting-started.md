# Guía de inicio local

Esta guía permite ejecutar el Perfilador en una computadora local. El proyecto se comporta como dos piezas que deben estar encendidas al mismo tiempo: el **backend** es el motor que calcula resultados y conversa con el modelo; el **frontend** es el tablero que la persona ve en el navegador. Por eso se usan dos terminales.

## Requisitos

Instala Git y Node.js LTS. Verifica que la terminal los reconoce antes de continuar:

```text
node -v
npm -v
git --version
```

Si alguno de los tres comandos no devuelve una versión, instala la herramienta faltante y abre una terminal nueva. Usa una versión actual de Node.js LTS; el proyecto usa Vite, React y TypeScript modernos.

## Windows con PowerShell

Abre PowerShell y primero navega a una ubicación conocida. `$HOME` representa tu carpeta de usuario, de modo que no necesitas adivinar dónde quedó el repositorio.

```powershell
Set-Location $HOME
Get-Location

if (-not (Test-Path .\perfiladorV1)) {
  git clone https://github.com/AlejoRoldan/perfiladorV1.git
}

Set-Location .\perfiladorV1
git pull origin main
Get-ChildItem
```

La última orden debe mostrar, entre otras, las carpetas `backend`, `frontend`, `agent` y `docs`. Solo después entra a `backend`; ejecutar `npm install` desde una carpeta que no contiene `package.json` causa el error que se vio anteriormente.

En la primera ventana, configura y arranca el backend:

```powershell
Set-Location $HOME\perfiladorV1\backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
npm ci
npm run dev
```

En el archivo que abre Notepad, escribe tu clave únicamente después de `OPENAI_API_KEY=`. El archivo final debe permanecer en tu equipo, no en GitHub. Guarda el archivo y deja esta ventana ejecutándose. Deberías ver el mensaje que indica `http://localhost:3001`.

En una segunda ventana de PowerShell, arranca el frontend:

```powershell
Set-Location $HOME\perfiladorV1\frontend
npm ci
npm run dev
```

Abre la URL que Vite muestre, normalmente `http://localhost:5173`. No hace falta configurar una clave en el frontend.

### Clave temporal en PowerShell

La configuración con `backend/.env` es preferible. Si necesitas probar una clave solo durante la sesión de PowerShell, usa esta sintaxis antes de `npm run dev`:

```powershell
$env:OPENAI_API_KEY = "TU_CLAVE_AQUI"
npm run dev
```

No uses `OPENAI_API_KEY=TU_CLAVE npm run dev`; esa sintaxis pertenece a shells de macOS y Linux, no a PowerShell.

## macOS y Linux

Clona el repositorio una sola vez y actualízalo al retomar el trabajo:

```bash
cd ~
git clone https://github.com/AlejoRoldan/perfiladorV1.git
cd ~/perfiladorV1
git pull origin main
```

En la primera terminal, prepara el backend. `cp -n` evita sobrescribir un `.env` existente.

```bash
cd ~/perfiladorV1/backend
cp -n .env.example .env
# Edita .env con tu editor y agrega OPENAI_API_KEY
npm ci
npm run dev
```

En una segunda terminal, inicia el frontend:

```bash
cd ~/perfiladorV1/frontend
npm ci
npm run dev
```

## Comprobación de salud

Antes de abrir la interfaz, puedes comprobar que la API está activa. El campo `agentConfigured` debe ser `true` cuando el backend recibió una clave no vacía en su entorno. La validez de esa clave se confirma al usar el chat.

```bash
curl http://localhost:3001/api/health
```

En PowerShell, puedes usar:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

## Problemas frecuentes

| Síntoma | Causa habitual | Solución |
|---|---|---|
| `npm` no se reconoce | Node.js no está instalado o la terminal es anterior a la instalación. | Instala Node.js LTS, cierra y vuelve a abrir PowerShell. |
| No aparece `package.json` | La terminal está en una carpeta incorrecta. | Ejecuta `Get-Location` y vuelve a entrar a `$HOME\perfiladorV1\backend` o `$HOME\perfiladorV1\frontend`. |
| `git` no se reconoce | Git no está instalado o no está en PATH. | Instala Git y abre una terminal nueva. |
| El chat devuelve que el agente no está configurado | Falta `OPENAI_API_KEY` o el backend no se reinició. | Revisa `backend/.env`, guarda y reinicia `npm run dev`. |
| El navegador no carga datos | El backend no está activo en el puerto 3001. | Mantén las dos terminales abiertas y consulta `/api/health`. |
| El puerto ya está en uso | Otro proceso ocupa 3001 o 5173. | Cierra el proceso anterior o define `PORT` en `backend/.env` y actualiza el proxy de Vite de forma coherente. |

## Actualización segura del código

Detén ambos procesos con `Ctrl+C`. Después, desde la raíz del repositorio, ejecuta `git pull origin main` y vuelve a ejecutar `npm ci` en las carpetas cuyo `package-lock.json` haya cambiado. No ejecutes `git clean` ni borres `backend/.env`, porque ese archivo contiene tu configuración local.

## Referencias

[1]: https://docs.npmjs.com/cli/v10/commands/npm-ci "npm ci documentation"
[2]: https://git-scm.com/doc "Git documentation"
[3]: https://platform.openai.com/docs/ "OpenAI API documentation"
