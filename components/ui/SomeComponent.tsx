import * as React from 'react'
import { Textarea } from './textarea'
import { MarkdownRenderer } from './MarkdownRenderer'

const SomeComponent: React.FC = () => {
  const [content, setContent] = React.useState('')

  return (
    <div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your markdown content here..."
      />
      <MarkdownRenderer content={content} />
    </div>
  )
}

export { SomeComponent }
