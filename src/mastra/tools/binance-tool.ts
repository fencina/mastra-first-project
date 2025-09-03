import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import {
  fetchAccount,
  fetchTickerPrice,
  AccountInfoSchema,
  TickerPriceSchema,
} from '../utils/binance-utils'

/**
 * Nota: la lógica de obtención de precio vive en utils (fetchTickerPrice)
 * para poder reutilizarla desde herramientas y workflows.
 */

/**
 * Herramienta de Mastra que permite obtener información de la cuenta de Binance
 * y, opcionalmente, el precio de un símbolo específico. Esta herramienta no realiza
 * operaciones de compra/venta; solo consulta datos.
 */
export const binanceTool = createTool({
  id: 'get-binance-data',
  description:
    'Obtiene información de la cuenta de Binance y opcionalmente el precio de un símbolo específico',
  inputSchema: z.object({
    symbol: z
      .string()
      .optional()
      .describe('Símbolo de trading, por ejemplo BTCUSDT. Si se omite, no se consulta precio.'),
  }),
  outputSchema: z.object({
    accountInfo: AccountInfoSchema,
    priceInfo: TickerPriceSchema.nullable(),
  }),
  execute: async ({ context }) => {
    const accountInfo = await fetchAccount()

    let priceInfo: any = null
    const symbol = context?.symbol
    
    if (symbol) {
      priceInfo = await fetchTickerPrice(symbol)
    }

    return { accountInfo, priceInfo }
  },
})
