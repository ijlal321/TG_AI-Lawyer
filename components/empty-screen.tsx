import { UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 border bg-background p-8">
        <h1 className="text-lg font-semibold">
          Welcome to Apna Waqeel. Your Legal  Companion.

        </h1>
        <p className="leading-normal text-sm">
          Apna Waqeel is a legal companion that helps you with your legal needs. You can ask questions, get legal advice, and find the right lawyer for your case.
          
          {/* </span> */}
        </p>
      </div>
    </div>
  )
}
