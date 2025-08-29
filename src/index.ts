// This index.ts file, outside src/mastra directory, can be used for an app that uses your mastra agents and workflows
import { mastra } from './mastra'

const calculatorAgent = mastra.getAgent('calculatorAgent')

const response = await calculatorAgent.generate([{ role: 'user', content: 'What is 2 + 2?' }])

console.log('Calculator Agent Response:', response.text)
