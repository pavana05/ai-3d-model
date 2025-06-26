"use client"

import { cn } from "@/lib/utils"

interface ColorfulProgressBarProps {
  totalTasks: number
  completedTasks: number
  className?: string
  isIndeterminate?: boolean
}

export default function ColorfulProgressBar({
  totalTasks,
  completedTasks,
  className,
  isIndeterminate = false,
}: ColorfulProgressBarProps) {
  // Calculate percentage
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div
      className={cn("w-full bg-black/50 rounded-full h-3 overflow-hidden border border-white/20 p-[1px]", className)}
    >
      {isIndeterminate ? (
        <div className="h-full relative w-full">
          <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 via-blue-500 to-cyan-500 absolute w-[60%] animate-progress-wave rounded-full opacity-80" />
          <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 absolute w-[40%] animate-progress-pulse rounded-full opacity-60" />
        </div>
      ) : (
        <div className="h-full relative rounded-full overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full" />

          {/* Progress gradient with animated shimmer */}
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 via-blue-500 to-cyan-500 transition-all duration-700 ease-out rounded-full relative overflow-hidden"
            style={{ width: `${percentage}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full" />

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 via-pink-400/50 via-blue-400/50 to-cyan-400/50 blur-sm rounded-full" />
          </div>

          {/* Completion sparkles */}
          {percentage > 90 && (
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
              <div className="w-1 h-1 bg-white rounded-full animate-ping" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
