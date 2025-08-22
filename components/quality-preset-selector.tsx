"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Globe,
  Smartphone,
  Monitor,
  Gamepad2,
  Printer,
  Film,
  Zap,
  Eye,
  Clock,
  HardDrive,
  Sparkles,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QualityPresetSelectorProps {
  selectedPreset: string
  onPresetChange: (preset: string) => void
  className?: string
}

const presetConfigs = {
  "web-optimized": {
    icon: Globe,
    label: "Web Optimized",
    description: "Fast loading, web-friendly models",
    color: "blue",
    metrics: { quality: 70, performance: 95, time: 4, size: 8 },
    features: ["Compressed textures", "Optimized geometry", "Fast loading"],
  },
  "mobile-friendly": {
    icon: Smartphone,
    label: "Mobile Friendly",
    description: "Lightweight models for mobile devices",
    color: "green",
    metrics: { quality: 60, performance: 100, time: 3, size: 5 },
    features: ["Ultra compressed", "Low poly", "Battery efficient"],
  },
  "desktop-quality": {
    icon: Monitor,
    label: "Desktop Quality",
    description: "High-quality models for desktop applications",
    color: "purple",
    metrics: { quality: 90, performance: 75, time: 8, size: 25 },
    features: ["High resolution", "AI upscaling", "Detailed textures"],
  },
  "vr-ready": {
    icon: Gamepad2,
    label: "VR/AR Ready",
    description: "Optimized for virtual and augmented reality",
    color: "cyan",
    metrics: { quality: 85, performance: 85, time: 7, size: 20 },
    features: ["LOD support", "Physics ready", "90fps optimized"],
  },
  "print-quality": {
    icon: Printer,
    label: "3D Print Quality",
    description: "Ultra-high detail for 3D printing",
    color: "orange",
    metrics: { quality: 100, performance: 40, time: 15, size: 60 },
    features: ["Watertight mesh", "Ultra detail", "Print optimized"],
  },
  cinematic: {
    icon: Film,
    label: "Cinematic",
    description: "Film-quality models for professional use",
    color: "pink",
    metrics: { quality: 100, performance: 30, time: 20, size: 80 },
    features: ["HDR lighting", "Subsurface scattering", "Film quality"],
  },
}

export default function QualityPresetSelector({
  selectedPreset,
  onPresetChange,
  className,
}: QualityPresetSelectorProps) {
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null)

  return (
    <Card className={cn("bg-slate-800/40 border-slate-600/60 backdrop-blur-sm", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-400" />
          Quality Presets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(presetConfigs).map(([preset, config]) => {
            const isSelected = selectedPreset === preset
            const isHovered = hoveredPreset === preset
            const { icon: Icon, label, color, metrics } = config

            return (
              <Button
                key={preset}
                onClick={() => onPresetChange(preset)}
                onMouseEnter={() => setHoveredPreset(preset)}
                onMouseLeave={() => setHoveredPreset(null)}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "h-auto p-4 flex flex-col items-center gap-3 transition-all duration-300 relative overflow-hidden",
                  isSelected
                    ? `bg-${color}-500/20 border-${color}-500/50 text-${color}-300 shadow-lg shadow-${color}-500/20`
                    : "border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30",
                  isHovered && !isSelected && "scale-105",
                )}
              >
                {/* Background gradient effect */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                    `from-${color}-500/10 to-${color}-600/10`,
                    (isSelected || isHovered) && "opacity-100",
                  )}
                />

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div
                    className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      isSelected ? `bg-${color}-500/30 shadow-lg` : "bg-slate-700/50",
                      isHovered && "scale-110",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="text-center">
                    <div className="font-semibold text-sm">{label}</div>
                    <div className="text-xs opacity-80 mt-1">
                      {metrics.time}min • {metrics.size}MB
                    </div>
                  </div>

                  {/* Quality indicator */}
                  <div className="w-full">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Quality</span>
                      <span>{metrics.quality}%</span>
                    </div>
                    <Progress value={metrics.quality} className="h-1" />
                  </div>
                </div>
              </Button>
            )
          })}
        </div>

        {/* Selected Preset Details */}
        {selectedPreset && selectedPreset !== "custom" && (
          <div className="space-y-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg bg-${presetConfigs[selectedPreset as keyof typeof presetConfigs].color}-500/20`}
              >
                <Sparkles className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {presetConfigs[selectedPreset as keyof typeof presetConfigs].label}
                </h3>
                <p className="text-gray-400 text-sm">
                  {presetConfigs[selectedPreset as keyof typeof presetConfigs].description}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(presetConfigs[selectedPreset as keyof typeof presetConfigs].metrics).map(
                ([key, value]) => {
                  const icons = {
                    quality: Eye,
                    performance: Zap,
                    time: Clock,
                    size: HardDrive,
                  }
                  const Icon = icons[key as keyof typeof icons]

                  return (
                    <div key={key} className="text-center">
                      <Icon className="h-4 w-4 mx-auto mb-1 text-gray-400" />
                      <div className="text-lg font-bold text-white">
                        {value}
                        {key === "time" ? "m" : key === "size" ? "MB" : "%"}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">{key}</div>
                    </div>
                  )
                },
              )}
            </div>

            {/* Features */}
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Key Features:</h4>
              <div className="flex flex-wrap gap-2">
                {presetConfigs[selectedPreset as keyof typeof presetConfigs].features.map((feature, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-slate-600/50 text-gray-300 border-slate-500/50"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
