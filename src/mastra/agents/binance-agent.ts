import { openai } from '@ai-sdk/openai'
import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'
import { binanceTool } from '../tools/binance-tool'

/**
 * Agente de Mastra encargado de interactuar con la API de Binance para
 * obtener información de la cuenta y precios de activos. Este agente se centra
 * en ofrecer resúmenes y datos, sin ejecutar órdenes ni recomendaciones de inversión.
 */
export const binanceAgent = new Agent({
  name: 'Binance Portfolio Agent',
  instructions: `
    Eres un asistente financiero que ayuda a consultar balances de la cuenta y precios de activos en Binance.
    Tu función principal es obtener información de la cuenta y generar resúmenes de forma clara.

    Pautas:
    - Nunca realices transacciones ni aconsejes comprar o vender activos.
    - Si el usuario solicita el balance de la cuenta, utiliza la herramienta para obtenerlo y presenta únicamente los activos con saldo positivo (free > 0).
    - Si el usuario proporciona un símbolo (por ejemplo, BTCUSDT), usa la herramienta para obtener su precio y preséntalo de forma sencilla.
    - Mantén las respuestas breves y en español, resaltando la información relevante.
    - Siempre menciona que los datos provienen de Binance.
  `,
  model: openai('gpt-4o-mini'),
  tools: { binanceTool },
  memory: new Memory({
    storage: new LibSQLStore({
      // Se almacena en memoria; cambiar a file:../mastra.db para persistir
      url: ':memory:',
    }),
  }),
})
