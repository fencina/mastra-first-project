import { Agent } from '@mastra/core'
import { openai } from '@ai-sdk/openai'

export const recruiterAgent = new Agent({
  name: 'Recruiter Agent',
  instructions: `You are a recruiter agent. Your job is to extract candidate details from the resume text and classify them as technical or non-technical.
                  When asked, generate a question for the candidate about their specialty if they are technical, or about the role if they are not technical.`,
  model: openai('gpt-4o-mini'),
})
