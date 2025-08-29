import { Agent } from '@mastra/core'
import { openai } from '@ai-sdk/openai'
import { stockTool } from '../tools/stock-tool'

export const stockAgent = new Agent({
  name: 'Stock Agent',
  instructions: `You are a stock agent. Your job is to provide stock market information based on user queries.
                  When the user asks about a stock, always:
                  1. Parse the stock symbol from the user's query.
                  2. Use the 'get-stock-price' tool to fetch the current stock price.
                  3. Return the stock symbol and the current price.
                  If the user asks for a stock that is not available, inform them that the stock symbol is not recognized.`,
  model: openai('gpt-4o-mini'),
  tools: {
    getStockPrice: stockTool,
  },
})
