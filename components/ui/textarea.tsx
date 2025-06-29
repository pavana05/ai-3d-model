import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-lg border-2 border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-base text-center placeholder:text-slate-400 placeholder:text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:bg-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-300 hover:bg-white/90 shadow-sm hover:shadow-md resize-none md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = "Textarea"

export { Textarea }
