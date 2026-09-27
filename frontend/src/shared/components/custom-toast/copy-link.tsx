import { useState } from "react"
import { Check, Link2Icon } from "lucide-react"
import { Button } from "@aqua-calendar/ui/components/button"

interface CopyLinkButtonProps {
  url: string
}

export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="px-2 text-xs"
    >
      {copied ? <Check size={3} /> : <Link2Icon size={3} />}
      <span className="">{copied ? "Copied!" : "Copy link"}</span>
    </Button>
  )
}
