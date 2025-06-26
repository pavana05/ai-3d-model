"use client"

import { useState, useEffect } from "react"
import {
  ExternalLink,
  Download,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
  Zap,
  Eye,
  Share2,
  Heart,
  Star,
  Info,
  Settings,
  Palette,
  Grid3X3,
  Globe,
} from "lucide-react"
import type { FormValues } from "@/lib/form-schema"
import { submitRodinJob, checkJobStatus, downloadModel } from "@/lib/api-service"
import ModelViewer from "./model-viewer"
import EnhancedForm from "./enhanced-form"
import StatusIndicator from "./status-indicator"
import OptionsDialog from "./options-dialog"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

export default function Rodin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [jobStatuses, setJobStatuses] = useState<Array<{ uuid: string; status: string }>>([])
  const [showOptions, setShowOptions] = useState(false)
  const [showPromptContainer, setShowPromptContainer] = useState(true)
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [currentImages, setCurrentImages] = useState<File[]>([])
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [backgroundEffect, setBackgroundEffect] = useState(0)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Enhanced background animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundEffect((prev) => (prev + 1) % 3)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const [options, setOptions] = useState({
    condition_mode: "concat" as const,
    quality: "medium" as const,
    geometry_file_format: "glb" as const,
    use_hyper: false,
    tier: "Regular" as const,
    TAPose: false,
    material: "PBR" as const,
    mesh_mode: "Quad" as const,
    mesh_simplify: true,
    mesh_smooth: true,
    texture_resolution: "2048" as const,
    lighting_mode: "auto" as const,
    camera_angle: "auto" as const,
    background_removal: true,
    edge_enhancement: false,
    detail_boost: "off" as const,
    detail_enhancement_mode: "all" as const,
    detail_preservation: true,
    surface_refinement: false,
    micro_detail_recovery: false,
    ai_upscaling: false,
    neural_enhancement: false,
    adaptive_lod: false,
    physics_simulation: false,
    animation_ready: false,
    uv_optimization: true,
    normal_map_generation: false,
    ambient_occlusion: false,
    subsurface_scattering: false,
    metallic_roughness: false,
    emission_mapping: false,
    displacement_mapping: false,
    multi_material_support: false,
    texture_atlas_optimization: false,
    mesh_compression: "none" as const,
    color_space: "sRGB" as const,
    export_variants: ["web"] as Array<"web" | "mobile" | "desktop" | "vr" | "ar" | "print">,
    batch_processing: false,
    version_control: false,
  })

  const handleOptionsChange = (newOptions: any) => {
    setOptions(newOptions)
  }

  async function handleStatusCheck(subscriptionKey: string, taskUuid: string) {
    try {
      setIsPolling(true)

      const data = await checkJobStatus(subscriptionKey)
      console.log("Status response:", data)

      if (!data.jobs || !Array.isArray(data.jobs) || data.jobs.length === 0) {
        throw new Error("No jobs found in status response")
      }

      setJobStatuses(data.jobs)

      const allJobsDone = data.jobs.every((job: any) => job.status === "Done")
      const anyJobFailed = data.jobs.some((job: any) => job.status === "Failed")

      if (allJobsDone) {
        setIsPolling(false)

        setTimeout(async () => {
          try {
            const downloadData = await downloadModel(taskUuid)
            console.log("Download response:", downloadData)

            if (downloadData.error && downloadData.error !== "OK") {
              throw new Error(`Download error: ${downloadData.error}`)
            }

            if (downloadData.list && downloadData.list.length > 0) {
              const glbFile = downloadData.list.find((file: { name: string }) =>
                file.name.toLowerCase().endsWith(".glb"),
              )

              if (glbFile) {
                const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(glbFile.url)}`
                setModelUrl(proxyUrl)
                setDownloadUrl(glbFile.url)
                setIsLoading(false)
                setShowPromptContainer(false)
              } else {
                setError("No GLB file found in the results")
                setIsLoading(false)
              }
            } else {
              setError("No files available for download")
              setIsLoading(false)
            }
          } catch (downloadErr) {
            setError(
              `Failed to download model: ${downloadErr instanceof Error ? downloadErr.message : "Unknown error"}`,
            )
            setIsLoading(false)
          }
        }, 1000)
      } else if (anyJobFailed) {
        setIsPolling(false)
        setError("Generation task failed")
        setIsLoading(false)
      } else {
        setTimeout(() => handleStatusCheck(subscriptionKey, taskUuid), 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check status")
      setIsPolling(false)
      setIsLoading(false)
    }
  }

  async function handleSubmit(values: FormValues) {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setModelUrl(null)
    setDownloadUrl(null)
    setJobStatuses([])

    setCurrentPrompt(values.prompt || "")
    setCurrentImages(values.images || [])

    try {
      const formData = new FormData()

      if (values.images && values.images.length > 0) {
        values.images.forEach((image) => {
          formData.append("images", image)
        })
      }

      if (values.prompt) {
        formData.append("prompt", values.prompt)
      }

      Object.entries(options).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, item))
        } else {
          formData.append(key, value.toString())
        }
      })

      const data = await submitRodinJob(formData)
      console.log("Generation response:", data)

      setResult(data)

      if (data.jobs && data.jobs.subscription_key && data.uuid) {
        handleStatusCheck(data.jobs.subscription_key, data.uuid)
      } else {
        setError("Missing required data for status checking")
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank")
    }
  }

  const handleShare = async () => {
    if (navigator.share && modelUrl) {
      try {
        await navigator.share({
          title: "3D AI Model Generator",
          text: "Check out this amazing 3D model I generated with AI!",
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleBack = () => {
    setShowPromptContainer(true)
    setError(null)
  }

  const ExternalLinks = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
      <a
        href="https://pavan-05.framer.ai/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-white/80 hover:text-white transition-all duration-300 text-sm group"
      >
        <Globe className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
        <span className="group-hover:scale-105 transition-transform">Portfolio</span>
        <ExternalLink className="h-3 w-3 ml-1 group-hover:rotate-12 transition-transform" />
      </a>
      <a
        href="https://developer.hyper3d.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-white/80 hover:text-blue-300 transition-all duration-300 text-sm group"
      >
        <Settings className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
        <span className="group-hover:scale-105 transition-transform">API Docs</span>
        <ExternalLink className="h-3 w-3 ml-1 group-hover:rotate-12 transition-transform" />
      </a>
    </div>
  )

  const backgroundEffects = [
    "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800",
    "bg-gradient-to-br from-blue-900/80 via-slate-900 to-purple-900/80",
    "bg-gradient-to-br from-purple-900/80 via-slate-900 to-blue-900/80",
  ]

  return (
    <TooltipProvider>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Enhanced animated background */}
        <div className={`fixed inset-0 transition-all duration-[8000ms] ${backgroundEffects[backgroundEffect]}`}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(147,51,234,0.1)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px] opacity-30" />
        </div>

        {/* Professional header */}
        <header className="relative z-20 bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo section */}
              <div className="flex-1">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10">
                    <Grid3X3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-2xl text-white font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                      3D AI Model Generator
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-gray-400 text-xs sm:text-sm">Made with ❤️ by Pavan.A</p>
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-900/50 text-blue-300 border-blue-500/30 hidden sm:inline-flex"
                      >
                        AI Powered
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop navigation */}
              {!isMobile && (
                <div className="flex items-center gap-4">
                  <ExternalLinks />
                  <Separator orientation="vertical" className="h-6 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowInfo(!showInfo)}
                          className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>About this app</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}

              {/* Mobile menu button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
            </div>

            {/* Mobile menu */}
            {isMobile && showMobileMenu && (
              <div className="border-t border-white/10 py-4 animate-in slide-in-from-top duration-300">
                <div className="space-y-4">
                  <ExternalLinks />
                  <Separator className="bg-white/10" />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowInfo(!showInfo)
                        setShowMobileMenu(false)
                      }}
                      className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2"
                    >
                      <Info className="h-4 w-4" />
                      About
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="relative flex-1">
          {/* 3D Viewer */}
          <div
            className={`relative transition-all duration-700 ease-in-out ${
              showPromptContainer ? "h-[40vh] sm:h-[50vh]" : "h-[60vh] sm:h-[70vh]"
            }`}
          >
            <ModelViewer modelUrl={isLoading ? null : modelUrl} />

            {/* Floating controls when model is loaded */}
            {!isLoading && modelUrl && (
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsLiked(!isLiked)}
                      size="icon"
                      className={`rounded-xl backdrop-blur-xl border border-white/20 transition-all duration-300 ${
                        isLiked
                          ? "bg-red-500/80 hover:bg-red-600/80 text-white"
                          : "bg-black/60 hover:bg-black/80 text-white"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""} transition-all duration-300`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isLiked ? "Unlike" : "Like"} this model</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleShare}
                      size="icon"
                      className="rounded-xl bg-black/60 backdrop-blur-xl border border-white/20 hover:bg-black/80 text-white transition-all duration-300"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this model</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Model status indicator */}
            {!isLoading && modelUrl && (
              <div className="absolute bottom-4 left-4 z-10">
                <Card className="bg-black/60 backdrop-blur-xl border-white/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white text-sm font-medium">Model Ready</span>
                      <Badge variant="outline" className="text-xs bg-green-900/50 text-green-300 border-green-500/30">
                        {options.quality.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Content section */}
          <div className="relative z-10 bg-gradient-to-t from-black via-black/95 to-transparent min-h-[60vh] sm:min-h-[50vh]">
            {/* Error message */}
            {error && (
              <div className="p-4 animate-in slide-in-from-bottom duration-500">
                <Card className="bg-red-900/20 border-red-500/30 shadow-xl backdrop-blur-xl max-w-4xl mx-auto">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 text-red-300">
                      <div className="p-2 rounded-full bg-red-500/20">
                        <X className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Generation Error</p>
                        <p className="text-sm opacity-90">{error}</p>
                      </div>
                      <Button
                        onClick={() => setError(null)}
                        variant="ghost"
                        size="sm"
                        className="text-red-300 hover:text-red-100 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Model controls */}
            {!isLoading && modelUrl && !showPromptContainer && (
              <div className="p-4 sm:p-6 lg:p-8 animate-in slide-in-from-bottom duration-700">
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <Button
                      onClick={handleBack}
                      className="w-full sm:w-auto bg-black/60 hover:bg-black/80 text-white border border-white/20 rounded-xl px-6 py-3 flex items-center justify-center gap-3 backdrop-blur-xl transition-all duration-300 hover:scale-105"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span className="font-medium">Generate Another</span>
                    </Button>

                    <Button
                      onClick={handleDownload}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-3 flex items-center justify-center gap-3 font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download Model</span>
                    </Button>
                  </div>

                  {/* Model statistics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-lg font-bold text-blue-400">{options.quality.toUpperCase()}</div>
                        <div className="text-xs text-gray-400">Quality</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-lg font-bold text-purple-400">{options.texture_resolution}px</div>
                        <div className="text-xs text-gray-400">Texture</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-lg font-bold text-green-400">
                          {options.geometry_file_format.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-400">Format</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-lg font-bold text-yellow-400">{options.material}</div>
                        <div className="text-xs text-gray-400">Material</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Input form */}
            {showPromptContainer && (
              <div className="p-4 sm:p-6 lg:p-8 animate-in slide-in-from-bottom duration-500">
                <EnhancedForm
                  isLoading={isLoading}
                  onSubmit={handleSubmit}
                  onOpenOptions={() => setShowOptions(true)}
                />
              </div>
            )}

            {/* Features showcase */}
            {!isLoading && !modelUrl && showPromptContainer && (
              <div className="p-4 sm:p-6 lg:p-8 border-t border-white/10 animate-in slide-in-from-bottom duration-700 delay-200">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Powered by Advanced AI
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                      Transform your ideas into stunning 3D models with cutting-edge artificial intelligence
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="group bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                            <Sparkles className="h-6 w-6 text-blue-400" />
                          </div>
                          <h3 className="text-white font-semibold text-lg">AI-Powered Generation</h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          Advanced neural networks create high-quality 3D models from your images and descriptions with
                          unprecedented accuracy.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="group bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 hover:border-green-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                            <Palette className="h-6 w-6 text-green-400" />
                          </div>
                          <h3 className="text-white font-semibold text-lg">Multiple Formats</h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          Export in GLB, USDZ, FBX, OBJ, and STL formats for any platform, game engine, or 3D printing
                          application.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="group bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30 hover:border-orange-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-xl bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                            <Star className="h-6 w-6 text-orange-400" />
                          </div>
                          <h3 className="text-white font-semibold text-lg">Professional Quality</h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          High-resolution textures, optimized geometry, and realistic materials ready for production
                          use.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="group bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                            <Zap className="h-6 w-6 text-purple-400" />
                          </div>
                          <h3 className="text-white font-semibold text-lg">Lightning Fast</h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          Generate complex 3D models in minutes, not hours. Our optimized AI pipeline ensures rapid
                          processing.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="group bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-xl bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                            <Eye className="h-6 w-6 text-cyan-400" />
                          </div>
                          <h3 className="text-white font-semibold text-lg">Real-time Preview</h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          Interactive 3D viewer with real-time rendering, allowing you to inspect your model from every
                          angle.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="group bg-gradient-to-br from-teal-900/30 to-green-900/30 border-teal-500/30 hover:border-teal-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-xl bg-teal-500/20 group-hover:bg-teal-500/30 transition-colors">
                            <Settings className="h-6 w-6 text-teal-400" />
                          </div>
                          <h3 className="text-white font-semibold text-lg">Advanced Options</h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          Fine-tune every aspect of your model with professional-grade controls and AI-powered
                          recommendations.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <footer className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-xl">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-gray-400 text-sm text-center sm:text-left">
                    Powered by Hyper3D Rodin API • Built with Next.js and Three.js
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-blue-900/50 text-blue-300 border-blue-500/30">
                      v2.0
                    </Badge>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>All systems operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </main>

        {/* Loading indicator */}
        <StatusIndicator isLoading={isLoading} jobStatuses={jobStatuses} />

        {/* Options dialog */}
        <OptionsDialog
          open={showOptions}
          onOpenChange={setShowOptions}
          options={options}
          onOptionsChange={handleOptionsChange}
          prompt={currentPrompt}
          images={currentImages}
        />

        {/* Info modal */}
        {showInfo && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="bg-slate-900/95 border-white/20 backdrop-blur-xl max-w-md w-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">About This App</h3>
                  <Button
                    onClick={() => setShowInfo(false)}
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3 text-gray-300 text-sm">
                  <p>
                    This 3D AI Model Generator uses advanced machine learning to create high-quality 3D models from
                    images and text descriptions.
                  </p>
                  <p>
                    Features include multiple export formats, real-time preview, and professional-grade quality
                    settings.
                  </p>
                  <p>Built with love by Pavan.A using Next.js, Three.js, and the Hyper3D Rodin API.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
