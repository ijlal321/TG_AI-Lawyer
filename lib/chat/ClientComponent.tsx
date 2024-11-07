'use client'

import { useEffect, useState } from 'react'
import { BotMessage } from '@/components/stocks/message'

export default function ClientComponent({ textStream, textNode }) {
  useEffect(() => {
    // Your client-side logic here
  }, [])

  return <BotMessage content={textStream.value} />
}
