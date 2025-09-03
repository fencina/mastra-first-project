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

## ToDo's
1. Binance auth wording: Binance uses API Key and Secret, not SSH keys. Private endpoints require HMAC SHA256 signatures with the API Secret. Ensure keys are managed via environment variables and never logged.

## Binance Workflow Usage

Prerequisites:
- Set `BINANCE_API_KEY` and `BINANCE_API_SECRET` in `.env`.
- Optionally set `BINANCE_API_BASE` (defaults to `https://api.binance.com`).

Example: run the workflow programmatically

```ts
import { mastra } from './src/mastra'

async function run() {
  const wf = mastra.getWorkflow('binanceWorkflow')
  const result = await wf.run({ input: { symbol: 'BTCUSDT' } })
  console.log(result.output.summary)
}

run().catch(console.error)
```

Example: use the agent to summarize balances

```ts
import { mastra } from './src/mastra'

async function runAgent() {
  const agent = mastra.getAgent('binanceAgent')
  const res = await agent.generate([
    { role: 'user', content: 'Muestrame mi balance en Binance' },
  ])
  console.log(res.text)
}

runAgent().catch(console.error)
```

### Timestamp Sync Notes
- Binance requires a `timestamp` on all private requests and validates it within a server-side window (`recvWindow`).
- This project keeps the default window (recommended by Binance) and instead syncs time by calling `/api/v3/time` and retrying once on `-1021 INVALID_TIMESTAMP`.
- If you still see timestamp errors, ensure your host clock is NTP-synced and network latency is stable. We intentionally avoid increasing `recvWindow` to follow Binance guidance.
