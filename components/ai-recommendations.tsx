"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Zap,
  Gamepad2,
  Building,
  Package,
  User,
  Smartphone,
  Printer,
  ChevronRight,
  TrendingUp,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UseCase {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  confidence: number
  settings: Record<string, any>
  benefits: string[]
  tradeoffs: string[]
}

interface AIRecommendationsProps {
  prompt: string
  images: File[]
  currentOptions: Record<string, any>
  onApplyRecommendation: (settings: Record<string, any>) => void
  className?: string
}

export default function AIRecommendations({
  prompt,
  images,
  currentOptions,
  onApplyRecommendation,
  className,
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<UseCase[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null)
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null)

  // Analyze input and generate recommendations
  useEffect(() => {
    if (prompt || images.length > 0) {
      analyzeInput()
    } else {
      setRecommendations([])
    }
  }, [prompt, images])

  const analyzeInput = async () => {
    setIsAnalyzing(true)

    // Simulate AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      const detectedUseCases = detectUseCases(prompt, images)
      setRecommendations(detectedUseCases)
    } catch (error) {
      console.error("Error analyzing input:", error)
      setRecommendations([])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const detectUseCases = (prompt: string, images: File[]): UseCase[] => {
    const useCases: UseCase[] = []
    const promptLower = prompt.toLowerCase()

    // Gaming/Interactive
    if (
      promptLower.includes("game") ||
      promptLower.includes("character") ||
      promptLower.includes("weapon") ||
      promptLower.includes("prop") ||
      promptLower.includes("asset") ||
      promptLower.includes("unity") ||
      promptLower.includes("unreal")
    ) {
      useCases.push({
        id: "gaming",
        name: "Gaming & Interactive",
        icon: <Gamepad2 className="h-5 w-5" />,
        description: "Optimized for game engines and real-time rendering",
        confidence: 92,
        settings: {
          quality: "medium",
          mesh_mode: "Triangle",
          mesh_simplify: true,
          texture_resolution: "2048",
          uv_optimization: true,
          adaptive_lod: true,
          physics_simulation: true,
          animation_ready: true,
          mesh_compression: "medium",
          export_variants: ["web", "desktop"],
          normal_map_generation: true,
          ambient_occlusion: true,
        },
        benefits: [
          "Optimized polygon count for real-time rendering",
          "LOD system for performance scaling",
          "Physics-ready collision meshes",
          "Animation-friendly topology",
        ],
        tradeoffs: ["Slightly reduced visual fidelity for performance", "Compressed textures may lose fine details"],
      })
    }

    // Architecture/Visualization
    if (
      promptLower.includes("building") ||
      promptLower.includes("house") ||
      promptLower.includes("room") ||
      promptLower.includes("interior") ||
      promptLower.includes("architecture") ||
      promptLower.includes("design") ||
      promptLower.includes("space")
    ) {
      useCases.push({
        id: "architecture",
        name: "Architecture & Visualization",
        icon: <Building className="h-5 w-5" />,
        description: "High-quality models for architectural visualization",
        confidence: 88,
        settings: {
          quality: "high",
          mesh_mode: "Quad",
          texture_resolution: "4096",
          lighting_mode: "studio",
          detail_boost: "high",
          surface_refinement: true,
          ambient_occlusion: true,
          metallic_roughness: true,
          color_space: "Linear",
          export_variants: ["desktop", "vr"],
          ai_upscaling: true,
          neural_enhancement: true,
        },
        benefits: [
          "Photorealistic quality for presentations",
          "High-resolution textures for close-up views",
          "Professional lighting setup",
          "VR-ready for immersive walkthroughs",
        ],
        tradeoffs: ["Larger file sizes", "Longer processing time", "Higher system requirements"],
      })
    }

    // Product Design/E-commerce
    if (
      promptLower.includes("product") ||
      promptLower.includes("item") ||
      promptLower.includes("object") ||
      promptLower.includes("tool") ||
      promptLower.includes("furniture") ||
      promptLower.includes("device") ||
      promptLower.includes("ecommerce") ||
      promptLower.includes("catalog")
    ) {
      useCases.push({
        id: "product",
        name: "Product Design & E-commerce",
        icon: <Package className="h-5 w-5" />,
        description: "Perfect for product catalogs and AR try-ons",
        confidence: 85,
        settings: {
          quality: "high",
          texture_resolution: "4096",
          background_removal: true,
          lighting_mode: "studio",
          detail_boost: "medium",
          metallic_roughness: true,
          export_variants: ["web", "mobile", "ar"],
          ai_upscaling: true,
          multi_material_support: true,
          texture_atlas_optimization: true,
        },
        benefits: [
          "Clean backgrounds for product shots",
          "AR-ready for try-before-buy",
          "Multi-platform compatibility",
          "Optimized for web loading",
        ],
        tradeoffs: ["May over-simplify complex textures", "Studio lighting may not suit all products"],
      })
    }

    // Character/Avatar Creation
    if (
      promptLower.includes("person") ||
      promptLower.includes("human") ||
      promptLower.includes("face") ||
      promptLower.includes("avatar") ||
      promptLower.includes("character") ||
      promptLower.includes("portrait")
    ) {
      useCases.push({
        id: "character",
        name: "Character & Avatar",
        icon: <User className="h-5 w-5" />,
        description: "Specialized for human figures and avatars",
        confidence: 90,
        settings: {
          TAPose: true,
          quality: "high",
          detail_boost: "high",
          subsurface_scattering: true,
          detail_enhancement_mode: "all",
          surface_refinement: true,
          micro_detail_recovery: true,
          animation_ready: true,
          texture_resolution: "4096",
          export_variants: ["desktop", "vr", "mobile"],
        },
        benefits: [
          "T/A pose for easy rigging",
          "Subsurface scattering for realistic skin",
          "High detail preservation for facial features",
          "Animation-ready topology",
        ],
        tradeoffs: ["Longer processing time for detail enhancement", "Larger file sizes due to high detail"],
      })
    }

    // 3D Printing
    if (
      promptLower.includes("print") ||
      promptLower.includes("3d print") ||
      promptLower.includes("miniature") ||
      promptLower.includes("figurine") ||
      promptLower.includes("prototype") ||
      promptLower.includes("model")
    ) {
      useCases.push({
        id: "printing",
        name: "3D Printing",
        icon: <Printer className="h-5 w-5" />,
        description: "Optimized for 3D printing with proper geometry",
        confidence: 87,
        settings: {
          geometry_file_format: "stl",
          mesh_mode: "Triangle",
          mesh_simplify: false,
          quality: "high",
          detail_boost: "ultra",
          edge_enhancement: true,
          export_variants: ["print"],
          mesh_compression: "none",
          displacement_mapping: true,
        },
        benefits: [
          "Watertight geometry for successful prints",
          "High detail preservation",
          "Optimized mesh density",
          "Print-ready file format",
        ],
        tradeoffs: ["Very large file sizes", "Longest processing time", "May require post-processing"],
      })
    }

    // Web/Mobile (default fallback)
    if (useCases.length === 0) {
      useCases.push({
        id: "web",
        name: "Web & Mobile",
        icon: <Smartphone className="h-5 w-5" />,
        description: "Balanced quality and performance for web applications",
        confidence: 75,
        settings: {
          quality: "medium",
          texture_resolution: "2048",
          mesh_compression: "low",
          export_variants: ["web", "mobile"],
          adaptive_lod: true,
          texture_atlas_optimization: true,
          background_removal: true,
        },
        benefits: [
          "Fast loading times",
          "Mobile-friendly file sizes",
          "Good visual quality",
          "Cross-platform compatibility",
        ],
        tradeoffs: ["Moderate detail level", "Compressed textures"],
      })
    }

    return useCases.sort((a, b) => b.confidence - a.confidence)
  }

  const applyRecommendation = (useCase: UseCase) => {
    setSelectedUseCase(useCase.id)
    onApplyRecommendation(useCase.settings)
  }

  const toggleDetails = (useCaseId: string) => {
    setExpandedDetails(expandedDetails === useCaseId ? null : useCaseId)
  }

  const getOptimizationScore = (settings: Record<string, any>) => {
    let score = 0
    if (settings.adaptive_lod) score += 15
    if (settings.mesh_compression !== "none") score += 10
    if (settings.texture_atlas_optimization) score += 10
    if (settings.uv_optimization) score += 10
    if (settings.mesh_simplify) score += 15
    return Math.min(score, 100)
  }

  const getQualityScore = (settings: Record<string, any>) => {
    let score = 50
    if (settings.quality === "high") score += 20
    if (settings.texture_resolution === "4096") score += 15
    if (settings.texture_resolution === "8192") score += 25
    if (settings.detail_boost === "high") score += 10
    if (settings.detail_boost === "ultra") score += 20
    if (settings.ai_upscaling) score += 10
    if (settings.neural_enhancement) score += 15
    return Math.min(score, 100)
  }

  if (!prompt && images.length === 0) {
    return null
  }

  return (
    <Card className={cn("bg-black/60 border-white/10 backdrop-blur-xl", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5 text-purple-400" />
          AI Recommendations
          {isAnalyzing && (
            <div className="ml-auto">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent" />
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Lightbulb className="h-4 w-4 animate-pulse text-yellow-400" />
              Analyzing your input...
            </div>
            <Progress value={75} className="h-2" />
            <div className="text-xs text-gray-500">Processing images and prompt to determine optimal settings</div>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((useCase, index) => (
              <div key={useCase.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        index === 0 ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20" : "bg-gray-800/50",
                      )}
                    >
                      {useCase.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{useCase.name}</h3>
                        {index === 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-purple-900/50 text-purple-300 border-purple-500/30"
                          >
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{useCase.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-green-400">{useCase.confidence}%</div>
                    <div className="text-xs text-gray-500">confidence</div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-gray-400">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span>Quality: {getQualityScore(useCase.settings)}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Zap className="h-3 w-3 text-blue-400" />
                    <span>Speed: {getOptimizationScore(useCase.settings)}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Target className="h-3 w-3 text-purple-400" />
                    <span>Match: {useCase.confidence}%</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => applyRecommendation(useCase)}
                    className={cn(
                      "flex-1 text-xs",
                      selectedUseCase === useCase.id
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : index === 0
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-white",
                    )}
                    disabled={selectedUseCase === useCase.id}
                  >
                    {selectedUseCase === useCase.id ? (
                      <>
                        <Zap className="h-3 w-3 mr-1" />
                        Applied
                      </>
                    ) : (
                      <>
                        Apply Settings
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDetails(useCase.id)}
                    className="text-xs border-white/20 text-gray-400 hover:text-white"
                  >
                    {expandedDetails === useCase.id ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                {/* Detailed breakdown */}
                {expandedDetails === useCase.id && (
                  <div className="mt-3 p-3 rounded-lg bg-gray-900/50 border border-white/10 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-2">Benefits</h4>
                      <ul className="space-y-1">
                        {useCase.benefits.map((benefit, i) => (
                          <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                            <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-yellow-400 mb-2">Trade-offs</h4>
                      <ul className="space-y-1">
                        {useCase.tradeoffs.map((tradeoff, i) => (
                          <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                            <div className="w-1 h-1 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                            {tradeoff}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Key settings preview */}
                    <div>
                      <h4 className="text-sm font-medium text-blue-400 mb-2">Key Settings</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Quality:</span>
                          <span className="text-white capitalize">{useCase.settings.quality || "medium"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Texture:</span>
                          <span className="text-white">{useCase.settings.texture_resolution || "2048"}px</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Detail Boost:</span>
                          <span className="text-white capitalize">{useCase.settings.detail_boost || "off"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Export:</span>
                          <span className="text-white">{useCase.settings.export_variants?.length || 1} formats</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* AI insights */}
            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium mb-1">AI Insight</p>
                  <p className="text-xs text-gray-400">
                    {recommendations.length > 0
                      ? `Based on your input, I detected ${recommendations[0].name.toLowerCase()} as the primary use case. 
                      The recommended settings balance quality and performance for optimal results.`
                      : "Provide more specific details in your prompt for better recommendations."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
