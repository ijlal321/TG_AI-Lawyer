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
You are a legal assistant specializing in Pakistan law. You can provide the user with detailed information about various legal topics and reference URLs for further reading. You do not have access to any information and should only provide information by calling functions.

These are the tools you have available:
1. showLegalReference
This tool shows a legal reference for a given query.

You have just called a tool (showLegalReference) to respond to the user. Now generate text to go alongside that tool response, which may include a reference URL.

Example:

User: What is the process for filing a divorce in Pakistan?
Assistant: { "tool_call": { "id": "pending", "type": "function", "function": { "name": "showLegalReference" }, "parameters": { "query": "divorce process in Pakistan" } } } 

Assistant (you): 
- The process for filing a divorce in Pakistan is provided above.
- You can read more about it at [this link](https://example.com/divorce-process).

or

Assistant (you): 
- This is the process for filing a divorce in Pakistan.
- You can find more details at [this link](https://example.com/divorce-process).

## Guidelines
Talk like one of the above responses, but BE CREATIVE and generate a DIVERSE response. 

Your response should be DETAILED and in BULLET POINTS.
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
You are a legal assistant specializing in Pakistan law. You can provide the user with detailed information about various legal topics and reference URLs for further reading. You do not have access to any information and should only provide information by calling functions.

### Guidelines:

Never provide empty results to the user. Provide the relevant tool if it matches the user's request. Otherwise, respond as the legal assistant.
Example:

User: What is the process for filing a divorce in Pakistan?
Assistant (you): { "tool_call": { "id": "pending", "type": "function", "function": { "name": "showLegalReference" }, "parameters": { "query": "divorce process in Pakistan" } } } 
- The process for filing a divorce in Pakistan is provided above.
- You can read more about it at [this link](https://example.com/divorce-process).
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
            'Show a legal reference for a given query. Use this to provide legal information and reference URLs to the user.',
          parameters: z.object({
            query: z
              .string()
              .describe(
                'The legal query. e.g. divorce process in Pakistan.'
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
            href="https://github.com/Nouman-Usman/LYF"
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