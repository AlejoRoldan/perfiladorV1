# Frontend

El frontend es una aplicación React creada con Vite. Presenta cuatro momentos de la experiencia: bienvenida, cuestionario, resultados y conversación. No contiene credenciales ni llama directamente a OpenAI; utiliza la capa `src/services/api.ts` para hablar con el backend mediante rutas relativas `/api`.

## Pantallas y estado

| Vista | Responsabilidad | Estado relevante |
|---|---|---|
| Bienvenida | Recoge identificador y rol. | `userId`, `roleId`. |
| Cuestionario | Registra cinco valores de 1 a 5. | Respuestas de la sesión. |
| Resultados | Muestra radar, scores y necesidades ordenadas. | `scoreEvent`, `necesidadEvent`. |
| Chat | Inicia y continúa el acompañamiento. | Historial en memoria del navegador. |

`App.tsx` coordina el recorrido como una máquina de estados sencilla. La página de chat envía el historial que tiene en memoria junto con el contexto del diagnóstico. Al recargar la página, ese historial se pierde por diseño en esta iteración.

## Desarrollo

Desde `frontend/`, ejecuta `npm ci` y después `npm run dev`. Vite inicia usualmente en `http://localhost:5173`. El proxy configurado en `vite.config.ts` reenvía `/api` a `http://localhost:3001`, así que el backend debe estar activo antes de completar un diagnóstico.

`npm run build` valida TypeScript y crea el paquete optimizado en `dist/`. `npm run lint` ejecuta las reglas configuradas por ESLint. No agregues una clave de OpenAI a `.env` del frontend; eso expondría un secreto al navegador.

## Criterios de cambio

Cuando se modifique un contrato HTTP, actualiza primero la validación y los tipos de backend, después la capa `services/api.ts` y por último los tipos espejo de `src/types`. Si esos contratos crecen, la siguiente mejora será extraerlos a un paquete compartido para que la verificación ocurra en compilación y no solo por convención.

## Referencias

[1]: https://react.dev/learn "React documentation"
[2]: https://vite.dev/guide/ "Vite guide"
