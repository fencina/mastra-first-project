# Mastra First Project

Este proyecto es una aplicación de ejemplo que utiliza agentes, herramientas y flujos de trabajo para demostrar una arquitectura modular en TypeScript.

## Estructura del proyecto

```
src/
  mastra/
    index.ts
    agents/
      weather-agent.ts
    tools/
      weather-tool.ts
    workflows/
      weather-workflow.ts
```

- **agents/**: Contiene agentes inteligentes, como el `weather-agent`, que interactúan con herramientas y flujos de trabajo.
- **tools/**: Herramientas reutilizables, como `weather-tool`, que proveen funcionalidades específicas.
- **workflows/**: Flujos de trabajo que orquestan la interacción entre agentes y herramientas.
- **index.ts**: Punto de entrada principal del módulo.

## Instalación

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```

## Uso

Ejecuta el proyecto con:
```bash
npm start
```

## Requisitos
- Node.js >= 18
- npm

## Contribución
Las contribuciones son bienvenidas. Abre un issue o envía un pull request.

## Licencia
MIT
