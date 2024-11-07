import 'server-only'

import { generateText } from 'ai'
import {
  createAI,
  getMutableAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { createOpenAI } from '@ai-sdk/openai'

import { BotCard, BotMessage } from '@/components/stocks/message'

import { z } from 'zod'
import { nanoid } from '@/lib/utils'
import { SpinnerMessage } from '@/components/stocks/message'
import { Message } from '@/lib/types'
import { toast } from 'sonner'

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

interface MutableAIState {
  update: (newState: any) => void
  done: (newState: any) => void
  get: () => AIState
}

const MODEL = 'llama3-70b-8192'
const TOOL_MODEL = 'llama3-70b-8192'
const GROQ_API_KEY_ENV = process.env.GROQ_API_KEY

async function generateCaption(
  query: string,
  toolName: string,
  aiState: MutableAIState
): Promise<string> {
  const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: GROQ_API_KEY_ENV
  })

  aiState.update({
    ...aiState.get(),
    messages: [...aiState.get().messages]
  })

  const captionSystemMessage =
    `\
You are a Pakistani law-based legal assistant. You provide legal information and references to Pakistani laws and regulations. You do not have access to any information and should only provide information by calling functions.

These are the tools you have available:
1. showLegalReference
This tool shows the relevant legal reference for a given query.

You have just called a tool (` +
    toolName +
    ` for ` +
    query +
    `) to respond to the user. Now generate text to go alongside that tool response, which may be a legal reference or explanation.
  
Example:

User: What is the punishment for theft in Pakistan?
Assistant: { "tool_call": { "id": "pending", "type": "function", "function": { "name": "showLegalReference" }, "parameters": { "query": "punishment for theft in Pakistan" } } } 

Assistant (you): The punishment for theft in Pakistan is provided above. According to the Pakistan Penal Code, Section 379, the punishment for theft is imprisonment of either description for a term which may extend to three years, or with fine, or with both.

or

Assistant (you): This is the punishment for theft in Pakistan. According to the Pakistan Penal Code, Section 379, the punishment for theft is imprisonment of either description for a term which may extend to three years, or with fine, or with both.

or 
Assistant (you): Would you like to know more about the legal procedures for theft cases in Pakistan?

## Guidelines
Talk like one of the above responses, but BE CREATIVE and generate a DIVERSE response. 

Your response should be BRIEF, about 2-3 sentences.

Besides the query, you cannot customize any of the references or explanations. Do not tell the user that you can.
    `

  try {
    const response = await generateText({
      model: groq(MODEL),
      messages: [
        {
          role: 'system',
          content: captionSystemMessage
        },
        ...aiState.get().messages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        }))
      ]
    })
    return response.text || ''
  } catch (err) {
    return '' // Send tool use without caption.
  }
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  try {
    const groq = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: GROQ_API_KEY_ENV
    })

    const result = await streamUI({
      model: groq(TOOL_MODEL),
      initial: <SpinnerMessage />,
      maxRetries: 1,
      system: `\
You are a Pakistani law-based legal assistant. You provide legal information and references to Pakistani laws and regulations. You do not have access to any information and should only provide information by calling functions.

### Guidelines:

Never provide empty results to the user. Provide the relevant tool if it matches the user's request. Otherwise, respond as the legal assistant.
Example:

User: What is the punishment for theft in Pakistan?
Assistant (you): { "tool_call": { "id": "pending", "type": "function", "function": { "name": "showLegalReference" }, "parameters": { "query": "punishment for theft in Pakistan" } } } 

Example 2:

User: What is the punishment for theft in Pakistan?
Assistant (you): { "tool_call": { "id": "pending", "type": "function", "function": { "name": "showLegalReference" }, "parameters": { "query": "punishment for theft in Pakistan" } } } 
    `,
      messages: [
        ...aiState.get().messages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        }))
      ],
      text: ({ content, done, delta }) => {
        if (!textStream) {
          textStream = createStreamableValue('')
          textNode = <BotMessage content={textStream.value} />
        }

        if (done) {
          textStream.done()
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content
              }
            ]
          })
        } else {
          textStream.update(delta)
        }

        return textNode
      },
      tools: {
        showLegalReference: {
          description:
            'Show the relevant legal reference for a given query. Use this to show the legal reference and explanation to the user.',
          parameters: z.object({
            query: z
              .string()
              .describe(
                'The legal query. e.g. punishment for theft in Pakistan.'
              )
          }),
          generate: async function* ({ query }) {
            yield (
              <BotCard>
                <></>
              </BotCard>
            )

            const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showLegalReference',
                      toolCallId,
                      args: { query }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showLegalReference',
                      toolCallId,
                      result: { query }
                    }
                  ]
                }
              ]
            })

            const caption = await generateCaption(
              query,
              'showLegalReference',
              aiState
            )

            return (
              <BotCard>
                <div>{caption}</div>
              </BotCard>
            )
          }
        }
      }
    })

    return {
      id: nanoid(),
      display: result.value
    }
  } catch (err: any) {
    // If key is missing, show error message that Groq API Key is missing.
    if (err.message.includes('OpenAI API key is missing.')) {
      err.message =
        'Groq API key is missing. Pass it using the GROQ_API_KEY environment variable. Try restarting the application if you recently changed your environment variables.'
    }
    return {
      id: nanoid(),
      display: (
        <div className="border p-4">
          <div className="text-red-700 font-medium">Error: {err.message}</div>
          <a
            href="https://github.com/bklieger-groq/stockbot-on-groq/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-red-800 hover:text-red-900"
          >
            If you think something has gone wrong, create an
            <span className="ml-1" style={{ textDecoration: 'underline' }}>
              {' '}
              issue on Github.
            </span>
          </a>
        </div>
      )
    }
  }
}

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] }
})
