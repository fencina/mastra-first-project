import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { getWeather } from '../utils/weather-utils'

export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windGust: z.number(),
    windSpeed: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async ({ context }) => {
    return await getWeather(context.location)
  },
})
