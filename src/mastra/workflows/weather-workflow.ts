import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import { getWeather } from '../utils/weather-utils'

const forecastSchema = z.object({
  date: z.string(),
  maxTemp: z.number(),
  minTemp: z.number(),
  precipitationChance: z.number(),
  condition: z.string(),
  location: z.string(),
})

// Step 1: Fetch weather forecast using the agent and weather tool
const fetchWeatherStep = createStep({
  id: 'fetch-weather',
  description: 'Fetches weather forecast for a given city',
  inputSchema: z.object({
    city: z.string().describe('The city to get the weather for'),
  }),
  outputSchema: forecastSchema,
  execute: async ({ inputData }) => {
    const weatherRaw = await getWeather(inputData.city)
    const weather = forecastSchema.parse({
      date: new Date().toISOString(),
      maxTemp: weatherRaw.temperature ?? 0,
      minTemp: weatherRaw.feelsLike ?? 0,
      precipitationChance: 0, // Open-Meteo current endpoint does not provide this
      condition: weatherRaw.conditions ?? 'Unknown',
      location: weatherRaw.location ?? inputData.city,
    })
    return weather
  },
})

// Step 2: Suggest activities based on weather forecast
const planActivitiesStep = createStep({
  id: 'plan-activities',
  description: 'Suggests activities based on weather conditions',
  inputSchema: forecastSchema,
  outputSchema: z.object({
    activities: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const forecast = inputData

    if (
      typeof forecast !== 'object' ||
      forecast === null ||
      typeof forecast.location !== 'string'
    ) {
      throw new Error('Forecast data not found')
    }

    const agent = mastra?.getAgent('weatherAgent')
    if (typeof agent !== 'object' || agent === null || typeof agent.stream !== 'function') {
      throw new Error('Weather agent not found')
    }

    const prompt = `Based on the following weather forecast for ${forecast.location}, suggest appropriate activities:
      ${JSON.stringify(forecast, null, 2)}
      For each day in the forecast, structure your response exactly as follows:

      📅 [Day, Month Date, Year]
      ═══════════════════════════

      🌡️ WEATHER SUMMARY
      • Conditions: [brief description]
      • Temperature: [X°C/Y°F to A°C/B°F]
      • Precipitation: [X% chance]

      🌅 MORNING ACTIVITIES
      Outdoor:
      • [Activity Name] - [Brief description including specific location/route]
        Best timing: [specific time range]
        Note: [relevant weather consideration]

      🌞 AFTERNOON ACTIVITIES
      Outdoor:
      • [Activity Name] - [Brief description including specific location/route]
        Best timing: [specific time range]
        Note: [relevant weather consideration]

      🏠 INDOOR ALTERNATIVES
      • [Activity Name] - [Brief description including specific venue]
        Ideal for: [weather condition that would trigger this alternative]

      ⚠️ SPECIAL CONSIDERATIONS
      • [Any relevant weather warnings, UV index, wind conditions, etc.]

      Guidelines:
      - Suggest 2-3 time-specific outdoor activities per day
      - Include 1-2 indoor backup options
      - For precipitation >50%, lead with indoor activities
      - All activities must be specific to the location
      - Include specific venues, trails, or locations
      - Consider activity intensity based on temperature
      - Keep descriptions concise but informative

      Maintain this exact formatting for consistency, using the emoji and section headers as shown.`

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ])

    let activitiesText = ''

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk)
      activitiesText += chunk
    }

    return {
      activities: activitiesText,
    }
  },
})

const weatherWorkflow = createWorkflow({
  id: 'weather-workflow',
  inputSchema: z.object({
    city: z.string().describe('The city to get the weather for'),
  }),
  outputSchema: z.object({
    activities: z.string(),
  }),
})
  .then(fetchWeatherStep)
  .then(planActivitiesStep)

weatherWorkflow.commit()

export { weatherWorkflow }
