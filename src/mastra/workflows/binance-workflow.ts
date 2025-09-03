import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import {
  fetchAccount,
  fetchTickerPrice,
  AccountInfoSchema,
  TickerPriceSchema,
} from '../utils/binance-utils'

/*
 * Paso 1: Obtener la información de la cuenta y el precio opcional de un símbolo
 */
const fetchPortfolioStep = createStep({
  id: 'fetch-binance-data',
  description:
    'Obtiene los balances de la cuenta de Binance y, opcionalmente, el precio de un símbolo',
  inputSchema: z.object({
    symbol: z
      .string()
      .optional()
      .describe('Símbolo de trading (por ejemplo BTCUSDT) para el cual se desea conocer el precio'),
  }),
  outputSchema: z.object({
    accountInfo: AccountInfoSchema,
    priceInfo: TickerPriceSchema.nullable(),
  }),
  execute: async ({ inputData }) => {
    const accountInfo = await fetchAccount()
    let priceInfo: { symbol: string; price: string } | null = null

    const symbol = inputData.symbol
    if (symbol && typeof symbol === 'string' && symbol.trim() !== '') {
      priceInfo = await fetchTickerPrice(symbol)
    }

    return { accountInfo, priceInfo }
  },
})

/*
 * Paso 2: Generar un resumen comprensible a partir de los datos obtenidos
 */
const summarizePortfolioStep = createStep({
  id: 'summarize-binance-portfolio',
  description: 'Resume los balances y precios obtenidos de Binance en un texto legible',
  inputSchema: z.object({
    accountInfo: AccountInfoSchema,
    priceInfo: TickerPriceSchema.nullable(),
  }),
  outputSchema: z.object({
    summary: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { accountInfo, priceInfo } = inputData
    // Filtrar balances con cantidad libre mayor a cero
    const positiveBalances = Array.isArray(accountInfo?.balances)
      ? accountInfo.balances.filter((b: { free: string }) => parseFloat(b.free) > 0)
      : []

    let summary = 'Resumen de cartera en Binance:\n'
    summary += positiveBalances
      .map(
        (b: { asset: string, free: string, locked: string }) =>
          `• ${b.asset}: ${b.free} disponibles${parseFloat(b.locked) > 0 ? ` (+${b.locked} bloqueados)` : ''}`
      )
      .join('\n')

    if (priceInfo != null) {
      summary += `\n\nPrecio de ${priceInfo.symbol}: ${priceInfo.price}`
    }

    return { summary }
  },
})

/*
 * Definición y compromiso del workflow
 */
const binanceWorkflow = createWorkflow({
  id: 'binance-workflow',
  inputSchema: z.object({
    symbol: z
      .string()
      .optional()
      .describe('Símbolo de trading para incluir en el informe (opcional)'),
  }),
  outputSchema: z.object({
    summary: z.string(),
  }),
})
  .then(fetchPortfolioStep)
  .then(summarizePortfolioStep)

// Registrar el workflow en Mastra
binanceWorkflow.commit()

export { binanceWorkflow }
