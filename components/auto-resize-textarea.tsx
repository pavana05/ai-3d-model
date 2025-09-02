"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number
  maxRows?: number
}

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, minRows = 3, maxRows = 12, value, onChange, style, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const [internalValue, setInternalValue] = React.useState<string>(
      (typeof value === "string" ? value : (props.defaultValue as string)) || "",
    )

    const resizeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const isResizingRef = React.useRef(false)

    React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

    const safeResize = React.useCallback(() => {
      if (isResizingRef.current) return

      const el = textareaRef.current
      if (!el) return

      try {
        isResizingRef.current = true
        // Defer to next frame to avoid sync layout thrash with ResizeObserver
        requestAnimationFrame(() => {
          try {
            el.style.height = "auto"

            const computed = getComputedStyle(el)
            const lineHeight = Number.parseInt(computed.lineHeight || "20", 10) || 20
            const minHeight = lineHeight * minRows
            const maxHeight = lineHeight * maxRows

            const newHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight)
            el.style.height = `${newHeight}px`
          } catch (err) {
            // Swallow non-fatal issues in measurement
            // eslint-disable-next-line no-console
            console.warn("AutoResizeTextarea resize error:", err)
          } finally {
            isResizingRef.current = false
          }
        })
      } catch (err) {
        isResizingRef.current = false
      }
    }, [minRows, maxRows])

    const debouncedResize = React.useCallback(() => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
      // ~60fps cadence
      resizeTimeoutRef.current = setTimeout(safeResize, 16)
    }, [safeResize])

    // Controlled value changes
    React.useEffect(() => {
      if (typeof value !== "undefined") {
        setInternalValue(value as string)
        debouncedResize()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    // Initial mount sizing
    React.useEffect(() => {
      debouncedResize()
      // Cleanup on unmount
      return () => {
        if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value)
      onChange?.(e)
      debouncedResize()
    }

    return (
      <textarea
        ref={textareaRef}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden transition-all",
          className,
        )}
        // Provide explicit min/max heights derived from minRows/maxRows to keep observers stable
        style={{
          minHeight: `${minRows * 20}px`,
          maxHeight: `${maxRows * 20}px`,
          ...style,
        }}
        value={typeof value !== "undefined" ? (value as string) : internalValue}
        onChange={handleChange}
        {...props}
      />
    )
  },
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"

export default AutoResizeTextarea
