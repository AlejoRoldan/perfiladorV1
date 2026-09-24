# Frontend del Perfilador Grupo Vázquez

Esta aplicación React implementa la experiencia de la Iteración 3: bienvenida, cuestionario de cinco preguntas, resultados por competencias y conversación de acompañamiento. Está construida con Vite, TypeScript, Tailwind CSS y Recharts.

## Ejecución local

El backend debe estar activo antes de usar la interfaz. Desde esta carpeta ejecuta:

```bash
npm ci
npm run dev
```

Vite mostrará una URL, habitualmente `http://localhost:5173`. Durante desarrollo, las solicitudes que comienzan con `/api` se redirigen a `http://localhost:3001` mediante el proxy definido en `vite.config.ts`.

No se requiere ni se debe configurar `OPENAI_API_KEY` en este proyecto. La clave vive exclusivamente en `backend/.env`.

## Calidad

Ejecuta `npm run build` para validar TypeScript y generar `dist/`. Ejecuta `npm run lint` para revisar las reglas de estilo. Los archivos generados están excluidos de Git.

## Estructura relevante

```text
src/
├── pages/       # Pantallas del flujo
├── services/    # Cliente HTTP concentrado en api.ts
├── types/       # Espejo temporal de contratos del backend
├── App.tsx      # Orquestación del recorrido de la persona usuaria
└── main.tsx     # Punto de entrada React
```

Consulta la [documentación detallada del frontend](../docs/frontend/README.md) y la [guía de inicio del repositorio](../docs/getting-started.md).

## Referencias

[1]: https://vite.dev/guide/ "Vite guide"
[2]: https://react.dev/learn "React documentation"
