"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number
  maxRows?: number
}

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, minRows = 1, maxRows = 10, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const [value, setValue] = React.useState(props.value || props.defaultValue || "")

    React.useImperativeHandle(ref, () => textareaRef.current!)

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight
      const lineHeight = Number.parseInt(getComputedStyle(textarea).lineHeight)
      const minHeight = lineHeight * minRows
      const maxHeight = lineHeight * maxRows

      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
    }, [minRows, maxRows])

    React.useEffect(() => {
      adjustHeight()
    }, [value, adjustHeight])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value)
      props.onChange?.(e)
      adjustHeight()
    }

    return (
      <textarea
        ref={textareaRef}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden",
          className,
        )}
        value={value}
        onChange={handleChange}
        {...props}
      />
    )
  },
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"

export default AutoResizeTextarea
