import React from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink } from '@/components/external-link'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      Apna Waqeel may provide  links to third-party websites, which are outside of our control. We are not responsible for the content of any linked site. Links to third-party websites are provided for convenience only and do not imply any endorsement of the content of the linked site.

    </p>
  )
}
