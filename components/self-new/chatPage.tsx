"use client"

import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { getMissingKeys } from '@/app/actions'
import { useEffect, useState } from 'react'


export default function IndexPage() {
  const [missingKeys, setMissingKeys] = useState<string[] | null>(null);

  useEffect(() => {

    const init = async () => {
      setMissingKeys(await getMissingKeys())
    }


    init();
  }, [])
  const id = nanoid()
  //   const missingKeys = await getMissingKeys()

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      {missingKeys && <Chat id={id} missingKeys={missingKeys} />}
    </AI>
  )
}
