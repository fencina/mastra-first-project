import { Mastra } from '@mastra/core/mastra'
import { PinoLogger } from '@mastra/loggers'
import { LibSQLStore } from '@mastra/libsql'
import {
  calculatorAgent,
  chefAgent,
  researchAgent,
  stockAgent,
  weatherAgent,
  binanceAgent,
} from '@/agents'
import { recruitmentWorkflow, weatherWorkflow, binanceWorkflow } from '@/workflows'
// import { PgVector } from '@mastra/pg'

// const pgVector = new PgVector({
//   connectionString: process.env.POSTGRES_CONNECTION_STRING ?? '',
// })

export const mastra = new Mastra({
  workflows: { weatherWorkflow, recruitmentWorkflow, binanceWorkflow },
  agents: { weatherAgent, calculatorAgent, chefAgent, stockAgent, researchAgent, binanceAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ':memory:',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
})
