"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Zap, Eye, TrendingUp, AlertTriangle, CheckCircle, Info, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface SmartOptionsPanelProps {
  currentOptions: Record<string, any>
  onOptionsChange: (options: Record<string, any>) => void
  className?: string
}

interface OptimizationSuggestion {
  id: string
  type: "performance" | "quality" | "compatibility" | "warning"
  title: string
  description: string
  impact: "low" | "medium" | "high"
  settings: Record<string, any>
  currentValue?: any
  suggestedValue?: any
}

export default function SmartOptionsPanel({ currentOptions, onOptionsChange, className }: SmartOptionsPanelProps) {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())

  // Analyze current settings and generate suggestions
  const analyzeSettings = () => {
    const newSuggestions: OptimizationSuggestion[] = []

    // Performance optimizations
    if (currentOptions.texture_resolution === "8192" && currentOptions.export_variants?.includes("mobile")) {
      newSuggestions.push({
        id: "mobile-texture",
        type: "performance",
        title: "Reduce Texture Size for Mobile",
        description: "Mobile devices may struggle with 8K textures. Consider 2K for better performance.",
        impact: "high",
        settings: { texture_resolution: "2048" },
        currentValue: "8192px",
        suggestedValue: "2048px",
      })
    }

    if (currentOptions.detail_boost === "ultra" && currentOptions.mesh_compression === "none") {
      newSuggestions.push({
        id: "compress-ultra-detail",
        type: "performance",
        title: "Enable Compression for Ultra Detail",
        description: "Ultra detail boost creates large files. Compression can reduce size by 40-60%.",
        impact: "medium",
        settings: { mesh_compression: "low" },
        currentValue: "None",
        suggestedValue: "Low compression",
      })
    }

    // Quality improvements
    if (currentOptions.quality === "high" && !currentOptions.ai_upscaling) {
      newSuggestions.push({
        id: "ai-upscaling-quality",
        type: "quality",
        title: "Enable AI Upscaling",
        description: "AI upscaling can enhance texture quality by 25-40% with minimal performance cost.",
        impact: "medium",
        settings: { ai_upscaling: true },
        currentValue: "Disabled",
        suggestedValue: "Enabled",
      })
    }

    if (currentOptions.material === "PBR" && !currentOptions.metallic_roughness) {
      newSuggestions.push({
        id: "pbr-materials",
        type: "quality",
        title: "Enable Metallic Roughness",
        description: "PBR materials work best with metallic roughness workflow for realistic rendering.",
        impact: "medium",
        settings: { metallic_roughness: true },
        currentValue: "Disabled",
        suggestedValue: "Enabled",
      })
    }

    // Compatibility warnings
    if (currentOptions.geometry_file_format === "usdz" && !currentOptions.export_variants?.includes("ar")) {
      newSuggestions.push({
        id: "usdz-ar",
        type: "compatibility",
        title: "USDZ Format for AR",
        description: "USDZ is primarily for AR experiences. Consider adding AR to export variants.",
        impact: "low",
        settings: { export_variants: [...(currentOptions.export_variants || []), "ar"] },
        currentValue: "Not included",
        suggestedValue: "Include AR variant",
      })
    }

    // Warnings
    if (currentOptions.detail_boost === "ultra" && currentOptions.quality === "extra-low") {
      newSuggestions.push({
        id: "conflicting-settings",
        type: "warning",
        title: "Conflicting Quality Settings",
        description: "Ultra detail boost with extra-low quality may not produce expected results.",
        impact: "high",
        settings: { quality: "medium" },
        currentValue: "Extra-low quality",
        suggestedValue: "Medium quality",
      })
    }

    setSuggestions(newSuggestions)
  }

  // Apply suggestion
  const applySuggestion = (suggestion: OptimizationSuggestion) => {
    const newOptions = { ...currentOptions, ...suggestion.settings }
    onOptionsChange(newOptions)
    setAppliedSuggestions((prev) => new Set([...prev, suggestion.id]))
  }

  // Calculate optimization scores
  const getPerformanceScore = () => {
    let score = 50
    if (currentOptions.mesh_compression !== "none") score += 15
    if (currentOptions.adaptive_lod) score += 15
    if (currentOptions.texture_atlas_optimization) score += 10
    if (currentOptions.mesh_simplify) score += 10
    if (currentOptions.texture_resolution === "1024") score += 20
    if (currentOptions.texture_resolution === "2048") score += 10
    if (currentOptions.texture_resolution === "4096") score -= 10
    if (currentOptions.texture_resolution === "8192") score -= 20
    if (currentOptions.detail_boost === "ultra") score -= 15
    return Math.max(0, Math.min(100, score))
  }

  const getQualityScore = () => {
    let score = 50
    if (currentOptions.quality === "high") score += 20
    if (currentOptions.ai_upscaling) score += 15
    if (currentOptions.neural_enhancement) score += 15
    if (currentOptions.detail_boost === "high") score += 10
    if (currentOptions.detail_boost === "ultra") score += 20
    if (currentOptions.texture_resolution === "4096") score += 10
    if (currentOptions.texture_resolution === "8192") score += 20
    return Math.min(100, score)
  }

  const getCompatibilityScore = () => {
    let score = 70
    if (currentOptions.export_variants?.length > 1) score += 15
    if (currentOptions.mesh_compression !== "none") score += 10
    if (currentOptions.color_space === "sRGB") score += 5
    return Math.min(100, score)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance":
        return <Zap className="h-4 w-4 text-blue-400" />
      case "quality":
        return <Eye className="h-4 w-4 text-green-400" />
      case "compatibility":
        return <Settings className="h-4 w-4 text-purple-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      default:
        return <Info className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "performance":
        return "border-blue-500/30 bg-blue-900/20"
      case "quality":
        return "border-green-500/30 bg-green-900/20"
      case "compatibility":
        return "border-purple-500/30 bg-purple-900/20"
      case "warning":
        return "border-yellow-500/30 bg-yellow-900/20"
      default:
        return "border-gray-500/30 bg-gray-900/20"
    }
  }

  const getImpactBadge = (impact: string) => {
    const colors = {
      low: "bg-gray-700 text-gray-300",
      medium: "bg-yellow-700 text-yellow-300",
      high: "bg-red-700 text-red-300",
    }
    return (
      <Badge variant="outline" className={`text-xs ${colors[impact as keyof typeof colors]}`}>
        {impact} impact
      </Badge>
    )
  }

  // Run analysis when options change
  useEffect(() => {
    analyzeSettings()
  }, [currentOptions])

  return (
    <Card className={cn("bg-black/60 border-white/10 backdrop-blur-xl", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="h-5 w-5 text-blue-400" />
          Smart Optimization
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-mono text-blue-400">{getPerformanceScore()}%</div>
            <div className="text-xs text-gray-400">Performance</div>
            <Progress value={getPerformanceScore()} className="h-1 mt-1" />
          </div>
          <div className="text-center">
            <div className="text-lg font-mono text-green-400">{getQualityScore()}%</div>
            <div className="text-xs text-gray-400">Quality</div>
            <Progress value={getQualityScore()} className="h-1 mt-1" />
          </div>
          <div className="text-center">
            <div className="text-lg font-mono text-purple-400">{getCompatibilityScore()}%</div>
            <div className="text-xs text-gray-400">Compatibility</div>
            <Progress value={getCompatibilityScore()} className="h-1 mt-1" />
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Optimization Suggestions
            </h4>

            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className={cn("p-3 rounded-lg border", getTypeColor(suggestion.type))}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(suggestion.type)}
                    <h5 className="text-sm font-medium text-white">{suggestion.title}</h5>
                  </div>
                  {getImpactBadge(suggestion.impact)}
                </div>

                <p className="text-xs text-gray-300 mb-3">{suggestion.description}</p>

                {suggestion.currentValue && suggestion.suggestedValue && (
                  <div className="flex items-center gap-2 text-xs mb-3">
                    <span className="text-gray-400">Current:</span>
                    <span className="text-red-300">{suggestion.currentValue}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-green-300">{suggestion.suggestedValue}</span>
                  </div>
                )}

                <Button
                  onClick={() => applySuggestion(suggestion)}
                  disabled={appliedSuggestions.has(suggestion.id)}
                  className={cn(
                    "w-full text-xs",
                    appliedSuggestions.has(suggestion.id)
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-700 hover:bg-gray-600",
                  )}
                >
                  {appliedSuggestions.has(suggestion.id) ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Applied
                    </>
                  ) : (
                    "Apply Suggestion"
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Settings Optimized</p>
            <p className="text-xs text-gray-400">Your current configuration looks great!</p>
          </div>
        )}

        {/* Quick optimization buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const optimizedSettings = {
                ...currentOptions,
                adaptive_lod: true,
                mesh_compression: "low",
                texture_atlas_optimization: true,
                uv_optimization: true,
              }
              onOptionsChange(optimizedSettings)
            }}
            className="text-xs border-blue-500/30 text-blue-400 hover:bg-blue-900/20"
          >
            <Zap className="h-3 w-3 mr-1" />
            Optimize Performance
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const qualitySettings = {
                ...currentOptions,
                ai_upscaling: true,
                neural_enhancement: true,
                detail_boost: "high",
                texture_resolution: "4096",
              }
              onOptionsChange(qualitySettings)
            }}
            className="text-xs border-green-500/30 text-green-400 hover:bg-green-900/20"
          >
            <Eye className="h-3 w-3 mr-1" />
            Maximize Quality
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
