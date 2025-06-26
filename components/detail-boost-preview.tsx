"use client"

import { useState } from "react"
import { Eye, EyeOff, Zap, Clock, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DetailBoostPreviewProps {
  detailLevel: "off" | "low" | "medium" | "high" | "ultra"
  enhancementMode: "surface" | "texture" | "geometry" | "all"
  className?: string
}

export default function DetailBoostPreview({ detailLevel, enhancementMode, className }: DetailBoostPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  const getDetailInfo = (level: string) => {
    switch (level) {
      case "low":
        return { quality: 10, time: 30, size: 15, color: "text-green-400" }
      case "medium":
        return { quality: 25, time: 60, size: 35, color: "text-yellow-400" }
      case "high":
        return { quality: 50, time: 120, size: 70, color: "text-orange-400" }
      case "ultra":
        return { quality: 100, time: 240, size: 150, color: "text-red-400" }
      default:
        return { quality: 0, time: 0, size: 0, color: "text-gray-400" }
    }
  }

  const info = getDetailInfo(detailLevel)

  if (detailLevel === "off") {
    return null
  }

  return (
    <Card className={`bg-black/50 border-white/10 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" />
            <span className="text-white font-mono text-sm">Detail Boost Active</span>
            <Badge variant="outline" className={`${info.color} border-current`}>
              {detailLevel.toUpperCase()}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="text-gray-400 hover:text-white"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {showPreview && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-green-400" />
                <span className="text-gray-400">Quality:</span>
                <span className="text-green-400">+{info.quality}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-yellow-400" />
                <span className="text-gray-400">Time:</span>
                <span className="text-yellow-400">+{info.time}s</span>
              </div>
              <div className="flex items-center gap-1">
                <HardDrive className="h-3 w-3 text-blue-400" />
                <span className="text-gray-400">Size:</span>
                <span className="text-blue-400">+{info.size}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-gray-400">Enhancement Focus:</div>
              <div className="flex flex-wrap gap-1">
                {enhancementMode === "all" ? (
                  <>
                    <Badge variant="secondary" className="text-xs bg-purple-900/50 text-purple-300">
                      Surface
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-blue-900/50 text-blue-300">
                      Texture
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-green-900/50 text-green-300">
                      Geometry
                    </Badge>
                  </>
                ) : (
                  <Badge variant="secondary" className="text-xs bg-purple-900/50 text-purple-300 capitalize">
                    {enhancementMode}
                  </Badge>
                )}
              </div>
            </div>

            {/* Visual quality indicator */}
            <div className="mt-3 p-2 rounded bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20">
              <div className="text-xs text-gray-400 mb-1">Expected Quality Improvement</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500`}
                    style={{ width: `${Math.min(info.quality, 100)}%` }}
                  />
                </div>
                <span className={`text-xs ${info.color} font-mono`}>{info.quality}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
