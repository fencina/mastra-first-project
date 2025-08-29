import { createStep, createWorkflow } from '@mastra/core'
import { z } from 'zod'
import { recruiterAgent } from '@/agents'

interface CandidateInfo {
  candidateName: string
  isTechnical: boolean
  specialty: string
  resumeText: string
}

const gatherCandidateInfoOutputSchema = z.object({
  candidateName: z.string().describe("Candidate's name"),
  isTechnical: z.boolean().describe("Candidate's technical status"),
  specialty: z.string().describe("Candidate's specialty or field of expertise"),
  resumeText: z.string().describe('The original resume text'),
})

const gatherCandidateInfo = createStep({
  id: 'gather-candidate-info',
  description: 'Gather candidate information from the resume text',
  inputSchema: z.object({
    resumeText: z.string().describe('The resume text to analyze'),
  }),
  outputSchema: gatherCandidateInfoOutputSchema,
  execute: async ({ inputData }): Promise<CandidateInfo> => {
    const { resumeText } = inputData

    if (typeof resumeText !== 'string' || resumeText.trim() === '') {
      throw new Error('Resume text must be a non-empty string')
    }

    const prompt = `Extract details from the resume text: "${resumeText}"`

    const agentResponse = await recruiterAgent.generate(prompt, {
      output: gatherCandidateInfoOutputSchema,
    })

    return agentResponse.object
  },
})

const askAboutSpecialty = createStep({
  id: 'ask-about-specialty',
  description: 'Generates a question about their specialty if is technical',
  inputSchema: gatherCandidateInfoOutputSchema,
  outputSchema: z.object({
    question: z.string().describe("Question about the candidate's specialty"),
  }),
  execute: async ({ inputData }) => {
    const { resumeText, specialty, candidateName } = inputData

    const prompt =
      `You are a recruiter. Given the resume below, craft a short question for` +
      `${candidateName} about how they got into "${specialty}". Resume: ${resumeText}`

    const res = await recruiterAgent.generate(prompt)

    if (typeof res.text !== 'string') {
      throw new Error('Failed to generate question about specialty')
    }

    return { question: res.text.trim() ?? '' }
  },
})

const askAboutRole = createStep({
  id: 'ask-about-role',
  description: 'Generates a question about the candidate’s role',
  inputSchema: gatherCandidateInfoOutputSchema,
  outputSchema: z.object({
    question: z.string().describe("Question about the candidate's role"),
  }),
  execute: async ({ inputData }) => {
    const { resumeText, candidateName } = inputData

    const prompt =
      `You are a recruiter. Given the resume below, craft a short question for` +
      `${candidateName} asking what interests them most about this role. Resume: ${resumeText}`

    const res = await recruiterAgent.generate(prompt)

    if (typeof res.text !== 'string') {
      throw new Error('Failed to generate question about role')
    }

    return { question: res.text.trim() ?? '' }
  },
})

const recruitmentWorkflow = createWorkflow({
  id: 'recruitment-workflow',
  description: 'Workflow to gather candidate information and ask questions',
  inputSchema: z.object({
    resumeText: z.string().describe('The resume text to analyze'),
  }),
  outputSchema: z.object({
    question: z.string().describe('Question for the candidate'),
  }),
})

recruitmentWorkflow.then(gatherCandidateInfo).branch([
  // Branch for technical candidates
  [
    async ({ inputData }) => inputData?.isTechnical,
    askAboutSpecialty,
  ],
  // Branch for non-technical candidates
  [
    async ({ inputData }) => !inputData?.isTechnical,
    askAboutRole,
  ],
])

recruitmentWorkflow.commit()

export { recruitmentWorkflow }
