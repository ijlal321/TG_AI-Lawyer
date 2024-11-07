'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState } from 'ai/rsc'
import { Message, Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { MissingApiKeyBanner } from '@/components/missing-api-key-banner'
import ReactMarkdown from 'react-markdown'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const [aiState] = useAIState()

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, session?.user, messages])

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
    console.log('Value: ', aiState.messages)
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  // const formattedMessage = `
  //   **Step 1: Meet the Eligibility Criteria**: You must be at least 18 years old to apply for a driving license in Pakistan. For a learner's permit, you must be at least 17 years old.
  //   **Step 2: Choose the Correct License Category**: There are different categories of driving licenses in Pakistan, including LTV (Light Transport Vehicle), HTV (Heavy Transport Vehicle), and Motorcycle.
  //   **Step 3: Gather Required Documents**: You will need to provide the following documents:
  //   • A valid CNIC (Computerized National Identity Card)
  //   • Two passport-sized photographs
  //   • A medical certificate (for HTV license only)
  //   • Proof of address (utility bills, etc.)
  //   **Step 4: Fill Out the Application Form**: You can obtain the application form from the local traffic police office or download it from their website. Fill it out carefully and accurately.
  //   **Step 5: Submit the Application**: Submit the application form along with the required documents and fee to the local traffic police office.
  //   **Step 6: Take the Written Test**: You will be required to take a written test to assess your knowledge of traffic rules and signs.
  //   **Step 7: Take the Driving Test**: Once you have passed the written test, you will be required to take a driving test to demonstrate your driving skills.
  //   **Step 8: Get Your License**: If you pass the driving test, your license will be issued. You can read more about the driving license application process in Pakistan at [this link](https://www.les.pk/driving-license/).
  // `;

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      {messages.length ? (
        <MissingApiKeyBanner missingKeys={missingKeys} />
      ) : (
        null
      )}

      <div
        className={cn(
          messages.length ? 'pb-[200px] pt-4 md:pt-6' : 'pb-[200px] pt-0',
          className
        )}
        ref={messagesRef}
      >
        {messages.length ? (
          <ChatList messages={messages} isShared={false} session={session} />
        ) : (
          <EmptyScreen />
        )}
        <div className="w-full h-px" ref={visibilityRef} />
        {/* <ReactMarkdown>{formattedMessage}</ReactMarkdown> */}
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
    </div>
  )
}
