import { Mastra } from '@mastra/core/mastra'
import { PinoLogger } from '@mastra/loggers'
import { LibSQLStore } from '@mastra/libsql'
import { calculatorAgent, chefAgent, researchAgent, stockAgent, weatherAgent } from '@/agents'
import { recruitmentWorkflow, weatherWorkflow } from '@/workflows'
// import { PgVector } from '@mastra/pg'

// const pgVector = new PgVector({
//   connectionString: process.env.POSTGRES_CONNECTION_STRING ?? '',
// })

export const mastra = new Mastra({
  workflows: { weatherWorkflow, recruitmentWorkflow },
  agents: { weatherAgent, calculatorAgent, chefAgent, stockAgent, researchAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ':memory:',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
})
