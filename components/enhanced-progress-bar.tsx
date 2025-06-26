"use client"

import { cn } from "@/lib/utils"

interface EnhancedProgressBarProps {
  value: number
  max?: number
  className?: string
  showPercentage?: boolean
  variant?: "default" | "success" | "warning" | "error"
  animated?: boolean
  size?: "sm" | "md" | "lg"
}

export default function EnhancedProgressBar({
  value,
  max = 100,
  className,
  showPercentage = false,
  variant = "default",
  animated = true,
  size = "md",
}: EnhancedProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  }

  const variantClasses = {
    default: "from-purple-500 via-blue-500 to-cyan-500",
    success: "from-green-500 via-emerald-500 to-teal-500",
    warning: "from-yellow-500 via-orange-500 to-red-500",
    error: "from-red-500 via-pink-500 to-rose-500",
  }

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className={cn("relative overflow-hidden rounded-full bg-gray-800/50", sizeClasses[size])}>
        <div
          className={cn(
            "h-full bg-gradient-to-r transition-all duration-700 ease-out rounded-full relative overflow-hidden",
            variantClasses[variant],
            animated && "animate-pulse",
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 blur-sm" />
        </div>

        {/* Completion sparkles */}
        {percentage > 90 && animated && (
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
            <div className="w-1 h-1 bg-white rounded-full animate-ping" />
          </div>
        )}
      </div>

      {showPercentage && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Progress</span>
          <span className="text-white font-mono">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  )
}
