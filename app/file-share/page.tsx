

import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { Session } from '@/lib/types'
import { getMissingKeys } from '@/app/actions'
import ChatPage from "@/components/self-new/chatPage"
import FileSharing from '@/components/self-new/fileSharing'
import { PadoNetworkContractClient, Utils } from '@padolabs/pado-network-sdk'

export const metadata = {
  title: 'Apna Waqeel'
}

export default async function IndexPage() {

  return (
    <>
      <FileSharing />
    </>
  )
}
