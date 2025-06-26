"use client"

import React, { useEffect, useRef, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
  minRows?: number
  maxRows?: number
}

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, minRows = 1, maxRows = 10, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    // Combine the forwarded ref with our local ref
    const setRefs = useCallback(
      (element: HTMLTextAreaElement) => {
        textareaRef.current = element
        if (typeof ref === "function") {
          ref(element)
        } else if (ref) {
          ref.current = element
        }
      },
      [ref],
    )

    const resizeTextarea = useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto"

      // Calculate the line height
      const computedStyle = window.getComputedStyle(textarea)
      const lineHeight = Number.parseInt(computedStyle.lineHeight) || 24

      // Calculate min and max heights
      const minHeight = lineHeight * minRows
      const maxHeight = lineHeight * maxRows

      // Set the height based on content, but within min/max bounds
      const scrollHeight = textarea.scrollHeight
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)

      textarea.style.height = `${newHeight}px`

      // Show scrollbar if content exceeds max height
      textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden"
    }, [minRows, maxRows])

    // Resize on mount and when content changes
    useEffect(() => {
      resizeTextarea()
    }, [resizeTextarea, props.value])

    // Handle input changes
    const handleInput = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        resizeTextarea()
        if (props.onChange) {
          props.onChange(e)
        }
      },
      [resizeTextarea, props.onChange],
    )

    return (
      <Textarea
        {...props}
        ref={setRefs}
        onChange={handleInput}
        className={cn(
          "resize-none transition-all duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none border-0 shadow-none",
          className,
        )}
        rows={minRows}
        style={{
          minHeight: `${24 * minRows}px`,
          maxHeight: `${24 * maxRows}px`,
        }}
      />
    )
  },
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"

export default AutoResizeTextarea
