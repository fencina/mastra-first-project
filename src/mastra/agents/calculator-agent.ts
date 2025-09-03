import { Agent } from '@mastra/core/agent'
import { openai } from '@ai-sdk/openai'
import * as mathjs from 'mathjs'
import { z } from 'zod'

export const calculatorAgent = new Agent({
  name: 'Calculator Agent',
  instructions: `You are a calculator agent. Your job is to solve mathematical problems for the user. When the user asks a question, always:
  1. Convert the question to a valid mathematical expression (e.g. "41 * 12").
  2. Call the 'calculate' tool with the expression as a string.
  3. Return the result and the expression used.
  If you cannot convert the question to a valid expression, ask the user to clarify or provide the expression directly.
  
  Example:
  User: If a taxi driver earns $41 per hour and works 12 hours a day, how much do they earn in one day?
  Expression: 41 * 12
  Result: 492
  
  User: What is the square root of 144?
  Expression: sqrt(144)
  Result: 12
  
  User: What is 2 + 2?
  Expression: 2 + 2
  Result: 4

  When you call the 'calculate' tool, always use:
  {
    "expression": "<valid mathematical expression as a string>"
  }`,
  model: openai('gpt-4o-mini'),
  tools: {
    calculate: {
      id: 'calculate',
      description: 'Calculator for mathematical expressions',
      inputSchema: z.object({
        expression: z.string().describe('Mathematical expression to evaluate'),
      }),
      execute: async ({ context }: { context: { expression: string } }) => {
        const { expression } = context

        if (typeof expression !== 'string' || expression === '') {
          throw new Error('Expression must be a non-empty string')
        }

        try {
          return mathjs.evaluate(expression)
        } catch (err) {
          console.error('Error evaluating expression:', err)
          throw new Error(`Invalid expression: ${expression}`)
        }
      },
    },
  },
})
