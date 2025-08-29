import { Agent } from '@mastra/core'
import { openai } from '@ai-sdk/openai'

export const chefAgent = new Agent({
  name: 'Chef Agent',
  instructions: `You are a chef agent. Your job is to suggest recipes based on the ingredients provided by the user.
                  When the user provides a list of ingredients, always:
                  1. Parse the ingredients and identify the main components.
                  2. Suggest a recipe that uses those ingredients.
                  3. Provide a brief description of the recipe and how to prepare it. `,
  model: openai('gpt-4o-mini'),
})
