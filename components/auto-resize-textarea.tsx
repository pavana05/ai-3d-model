"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number
  maxRows?: number
}

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, minRows = 1, maxRows = 10, value, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const [internalValue, setInternalValue] = React.useState(value || props.defaultValue || "")
    const resizeTimeoutRef = React.useRef<NodeJS.Timeout>()
    const isResizingRef = React.useRef(false)

    React.useImperativeHandle(ref, () => textareaRef.current!)

    // Debounced resize function to prevent ResizeObserver loop
    const debouncedResize = React.useCallback(() => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }

      resizeTimeoutRef.current = setTimeout(() => {
        if (isResizingRef.current) return

        const textarea = textareaRef.current
        if (!textarea) return

        try {
          isResizingRef.current = true

          // Use requestAnimationFrame to avoid layout thrashing
          requestAnimationFrame(() => {
            try {
              textarea.style.height = "auto"
              const scrollHeight = textarea.scrollHeight
              const lineHeight = Number.parseInt(getComputedStyle(textarea).lineHeight) || 20
              const minHeight = lineHeight * minRows
              const maxHeight = lineHeight * maxRows

              const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
              textarea.style.height = `${newHeight}px`
            } catch (error) {
              console.warn("Error resizing textarea:", error)
            } finally {
              isResizingRef.current = false
            }
          })
        } catch (error) {
          console.warn("Error in resize operation:", error)
          isResizingRef.current = false
        }
      }, 16) // ~60fps
    }, [minRows, maxRows])

    // Effect to handle value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
        debouncedResize()
      }
    }, [value, debouncedResize])

    // Initial resize on mount
    React.useEffect(() => {
      debouncedResize()
    }, [debouncedResize])

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current)
        }
      }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)

      // Call parent onChange if provided
      if (onChange) {
        onChange(e)
      }

      // Debounce the resize operation
      debouncedResize()
    }

    return (
      <textarea
        ref={textareaRef}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden transition-all duration-200",
          className,
        )}
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        style={{
          minHeight: `${20 * minRows}px`,
          maxHeight: `${20 * maxRows}px`,
        }}
        {...props}
      />
    )
  },
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"

export default AutoResizeTextarea
