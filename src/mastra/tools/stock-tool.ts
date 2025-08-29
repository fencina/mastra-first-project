import { createTool } from '@mastra/core'
import { z } from 'zod'
import axios from 'axios'

const getStockPrice = async (symbol: string): Promise<string> => {
  const data = await axios(
    `https://mastra-stock-data.vercel.app/api/stock-data?symbol=${symbol}`
  ).then((res: any) => res.data)

  return data.prices['4. close']
}

export const stockTool = createTool({
  id: 'get-stock-price',
  description: `Fetches the last day's closing stock price for a given symbol`,
  inputSchema: z.object({
    symbol: z.string().describe('The stock symbol to get the price for'),
  }),
  outputSchema: z.object({
    symbol: z.string().describe('Stock symbol'),
    currentPrice: z.string().describe('Current stock price'),
  }),
  execute: async ({ context }) => {
    const { symbol } = context

    if (typeof symbol !== 'string' || symbol.trim() === '') {
      throw new Error('Symbol must be a non-empty string')
    }

    try {
      return {
        symbol,
        currentPrice: await getStockPrice(symbol),
      }
    } catch (error) {
      console.error('Error fetching stock price:', error)
      throw new Error(`Failed to fetch stock price for symbol: ${symbol}`)
    }
  },
})
