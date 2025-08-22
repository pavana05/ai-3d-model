"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Clock,
  HardDrive,
  Zap,
  Eye,
  Cpu,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Download,
  Share2,
  Bookmark,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ModelAnalyticsProps {
  settings: Record<string, any>
  onOptimize?: () => void
  className?: string
}

export default function ModelAnalytics({ settings, onOptimize, className }: ModelAnalyticsProps) {
  const [metrics, setMetrics] = useState({
    qualityScore: 0,
    performanceScore: 0,
    estimatedTime: 0,
    estimatedSize: 0,
    complexityScore: 0,
    optimizationScore: 0,
  })

  const [recommendations, setRecommendations] = useState<
    Array<{
      type: "warning" | "info" | "success"
      title: string
      description: string
      action?: string
    }>
  >([])

  useEffect(() => {
    calculateMetrics()
    generateRecommendations()
  }, [settings])

  const calculateMetrics = () => {
    // Quality Score Calculation
    let quality = 50
    if (settings.quality === "high") quality += 20
    if (settings.quality === "ultra") quality += 35
    if (settings.texture_resolution === "4096") quality += 15
    if (settings.texture_resolution === "8192") quality += 25
    if (settings.ai_upscaling) quality += 15
    if (settings.neural_enhancement) quality += 20
    if (settings.detail_boost === "high") quality += 10
    if (settings.detail_boost === "ultra") quality += 20
    if (settings.facial_detail_enhancement) quality += 10
    if (settings.eye_clarity_boost) quality += 10

    // Performance Score Calculation
    let performance = 80
    if (settings.mesh_compression !== "none") performance += 10
    if (settings.adaptive_lod) performance += 15
    if (settings.texture_compression !== "none") performance += 10
    if (settings.texture_resolution === "8192") performance -= 20
    if (settings.detail_boost === "ultra") performance -= 15
    if (settings.neural_enhancement) performance -= 10

    // Time Estimation (in minutes)
    let time = 2
    if (settings.quality === "high") time += 3
    if (settings.quality === "ultra") time += 6
    if (settings.texture_resolution === "4096") time += 2
    if (settings.texture_resolution === "8192") time += 5
    if (settings.detail_boost === "high") time += 2
    if (settings.detail_boost === "ultra") time += 4
    if (settings.ai_upscaling) time += 2
    if (settings.neural_enhancement) time += 3

    // Size Estimation (in MB)
    let size = 5
    if (settings.texture_resolution === "2048") size += 10
    if (settings.texture_resolution === "4096") size += 25
    if (settings.texture_resolution === "8192") size += 60
    if (settings.mesh_compression === "none") size *= 1.5
    if (settings.mesh_compression === "high") size *= 0.6
    if (settings.normal_map_generation) size += 15

    // Complexity Score
    let complexity = 30
    const enabledFeatures = Object.values(settings).filter((v) => v === true).length
    complexity += enabledFeatures * 3
    if (settings.style_transfer !== "none") complexity += 15
    if (settings.morph_targets) complexity += 20

    // Optimization Score
    let optimization = 60
    if (settings.mesh_compression !== "none") optimization += 15
    if (settings.texture_compression !== "none") optimization += 10
    if (settings.adaptive_lod) optimization += 15
    if (settings.lod_generation) optimization += 10

    setMetrics({
      qualityScore: Math.min(100, quality),
      performanceScore: Math.max(0, Math.min(100, performance)),
      estimatedTime: time,
      estimatedSize: size,
      complexityScore: Math.min(100, complexity),
      optimizationScore: Math.min(100, optimization),
    })
  }

  const generateRecommendations = () => {
    const recs = []

    // Quality recommendations
    if (settings.quality === "low" && settings.facial_detail_enhancement) {
      recs.push({
        type: "warning" as const,
        title: "Quality Mismatch",
        description: "Facial enhancement works best with 'High' or 'Ultra' quality settings",
        action: "Increase quality level",
      })
    }

    // Performance recommendations
    if (settings.texture_resolution === "8192" && !settings.texture_compression) {
      recs.push({
        type: "info" as const,
        title: "Large File Size",
        description: "8K textures without compression will create very large files",
        action: "Enable texture compression",
      })
    }

    // Facial enhancement recommendations
    if (settings.facial_detail_enhancement && !settings.eye_clarity_boost) {
      recs.push({
        type: "info" as const,
        title: "Enhanced Eyes",
        description: "Enable eye clarity boost for even better facial results",
        action: "Enable eye clarity",
      })
    }

    // Optimization recommendations
    if (settings.quality === "ultra" && !settings.adaptive_lod) {
      recs.push({
        type: "info" as const,
        title: "Performance Optimization",
        description: "Ultra quality models benefit from adaptive LOD for better performance",
        action: "Enable adaptive LOD",
      })
    }

    // Success messages
    if (settings.facial_detail_enhancement && settings.eye_clarity_boost && settings.quality === "high") {
      recs.push({
        type: "success" as const,
        title: "Optimal Facial Setup",
        description: "Your settings are optimized for high-quality facial models",
      })
    }

    setRecommendations(recs)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20"
    if (score >= 60) return "bg-yellow-500/20"
    return "bg-red-500/20"
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-800/40 border-slate-600/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">Quality</span>
              </div>
              <span className={cn("text-lg font-bold", getScoreColor(metrics.qualityScore))}>
                {metrics.qualityScore}%
              </span>
            </div>
            <Progress value={metrics.qualityScore} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/40 border-slate-600/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-300">Performance</span>
              </div>
              <span className={cn("text-lg font-bold", getScoreColor(metrics.performanceScore))}>
                {metrics.performanceScore}%
              </span>
            </div>
            <Progress value={metrics.performanceScore} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/40 border-slate-600/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-gray-300">Est. Time</span>
              </div>
              <span className="text-lg font-bold text-purple-400">{metrics.estimatedTime}m</span>
            </div>
            <Progress value={(metrics.estimatedTime / 20) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/40 border-slate-600/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-gray-300">File Size</span>
              </div>
              <span className="text-lg font-bold text-orange-400">{metrics.estimatedSize.toFixed(1)}MB</span>
            </div>
            <Progress value={(metrics.estimatedSize / 100) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/40 border-slate-600/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-gray-300">Complexity</span>
              </div>
              <span className={cn("text-lg font-bold", getScoreColor(metrics.complexityScore))}>
                {metrics.complexityScore}%
              </span>
            </div>
            <Progress value={metrics.complexityScore} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/40 border-slate-600/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-pink-400" />
                <span className="text-sm text-gray-300">Optimization</span>
              </div>
              <span className={cn("text-lg font-bold", getScoreColor(metrics.optimizationScore))}>
                {metrics.optimizationScore}%
              </span>
            </div>
            <Progress value={metrics.optimizationScore} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-slate-800/40 border-slate-600/60 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, index) => {
              const icons = {
                warning: AlertTriangle,
                info: Activity,
                success: CheckCircle,
              }
              const colors = {
                warning: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
                info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                success: "text-green-400 bg-green-500/10 border-green-500/20",
              }
              const Icon = icons[rec.type]

              return (
                <div key={index} className={cn("p-4 rounded-lg border", colors[rec.type])}>
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-300 mb-2">{rec.description}</p>
                      {rec.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-current text-current hover:bg-current/10 bg-transparent"
                          onClick={onOptimize}
                        >
                          {rec.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
        >
          <Bookmark className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Settings
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Config
        </Button>
      </div>
    </div>
  )
}
