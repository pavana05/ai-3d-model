import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 sm:p-8",
        // Glass morphism effect with premium styling
        "bg-gradient-to-br from-background/98 via-background/95 to-background/92",
        "backdrop-blur-xl",
        "rounded-xl",
        "border border-white/10",
        "shadow-lg shadow-black/20",
        // Premium edge highlights and depth
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:pointer-events-none",
        "after:absolute after:top-0 after:left-6 after:right-6 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent",
        // Smooth transitions for professional feel
        "transition-all duration-300 ease-out",
        // Hover states for interactivity
        "hover:shadow-xl hover:shadow-blue-500/5 hover:border-white/15",
        "hover:bg-gradient-to-br hover:from-background/99 hover:via-background/97 hover:to-background/94",
        // Subtle scale effect on hover
        "hover:scale-[1.005]",
        // Overflow hidden for clean edge rendering
        "overflow-hidden",
        className,
      )}
      {...props}
    />
  ),
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
