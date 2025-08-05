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
  User,
  LogOut,
  Save,
  Folder,
} from "lucide-react"
import type { FormValues } from "@/lib/form-schema"
import { submitRodinJob, checkJobStatus, downloadModel } from "@/lib/api-service"
import ModelViewer from "./model-viewer"
import EnhancedForm from "./enhanced-form"
import StatusIndicator from "./status-indicator"
import OptionsDialog from "./options-dialog"
import LoginDialog from "./auth/login-dialog"
import SavedModelsDialog from "./saved-models-dialog"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

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
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showSavedModels, setShowSavedModels] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveModelName, setSaveModelName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const { user, logout, saveModel } = useAuth()
  const { toast } = useToast()

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
              console.log("Files available for download:", downloadData.list) // Log all files
              const glbFile = downloadData.list.find((file: { name: string }) =>
                file.name.toLowerCase().endsWith(".glb"),
              )

              if (glbFile) {
                console.log("Found GLB file:", glbFile)

                // Use proxy URL directly
                const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(glbFile.url)}`
                console.log("Using proxy URL:", proxyUrl)

                // Test the proxy URL before setting it
                try {
                  const testResponse = await fetch(proxyUrl, { method: "HEAD" })
                  if (testResponse.ok) {
                    console.log("Proxy URL is accessible")
                    setModelUrl(proxyUrl)
                    setDownloadUrl(glbFile.url)
                    setIsLoading(false)
                    setShowPromptContainer(false)
                  } else {
                    throw new Error(`Proxy returned ${testResponse.status}`)
                  }
                } catch (proxyError) {
                  console.error("Proxy test failed:", proxyError)
                  // Try direct URL as fallback
                  console.log("Trying direct URL as fallback")
                  setModelUrl(glbFile.url)
                  setDownloadUrl(glbFile.url)
                  setIsLoading(false)
                  setShowPromptContainer(false)
                }
              } else {
                console.error("No GLB file found in the results. Available files:", downloadData.list) // Log available files
                setError("No GLB file found in the results. Please check the console for details.")
                setIsLoading(false)
              }
            } else {
              setError("No files available for download")
              setIsLoading(false)
            }
          } catch (downloadErr) {
            console.error("Download error:", downloadErr)
            setError(
              `Failed to download model: ${downloadErr instanceof Error ? downloadErr.message : "Unknown error"}`,
            )
            setIsLoading(false)
          }
        }, 1000)
      } else if (anyJobFailed) {
        setIsPolling(false)
        const failedJob = data.jobs.find((job: any) => job.status === "Failed")
        setError(`Generation task failed${failedJob?.error ? `: ${failedJob.error}` : ""}`)
        setIsLoading(false)
      } else {
        setTimeout(() => handleStatusCheck(subscriptionKey, taskUuid), 2000)
      }
    } catch (err) {
      console.error("Status check error:", err)
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
      console.error("Submit error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank")
    }
  }

  const handleSaveModel = async () => {
    if (!user) {
      setShowLoginDialog(true)
      return
    }

    if (!modelUrl || !currentPrompt) {
      toast({
        title: "Cannot Save Model",
        description: "No model available to save. Please generate a model first.",
        variant: "destructive",
      })
      return
    }

    // Auto-generate a name if none provided
    const defaultName = `3D Model - ${new Date().toLocaleDateString()}`
    setSaveModelName(defaultName)
    setShowSaveDialog(true)
  }

  const handleSaveConfirm = async () => {
    if (!saveModelName.trim()) {
      toast({
        title: "Model Name Required",
        description: "Please enter a name for your model.",
        variant: "destructive",
      })
      return
    }

    if (!modelUrl || !currentPrompt) {
      toast({
        title: "Save Failed",
        description: "No model data available to save.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const result = await saveModel({
        name: saveModelName.trim(),
        prompt: currentPrompt,
        modelUrl: modelUrl,
      })

      if (result.success) {
        setShowSaveDialog(false)
        setSaveModelName("")
        toast({
          title: "Model Saved Successfully!",
          description: `"${saveModelName.trim()}" has been saved to your profile.`,
        })
      } else {
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save model. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Save model error:", error)
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred while saving the model.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadModel = (url: string, prompt: string) => {
    setModelUrl(url)
    setCurrentPrompt(prompt)
    setShowPromptContainer(false)
    toast({
      title: "Model Loaded",
      description: "Your saved model has been loaded successfully.",
    })
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
      toast({
        title: "Link Copied",
        description: "Model link has been copied to your clipboard.",
      })
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
                  <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 flex-shrink-0">
                    <Grid3X3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </div>
                  <div className="min-w-0">
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
                    {user ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2 px-3"
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <User className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm">{user.name}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-900/95 border-white/20 backdrop-blur-xl">
                          <DropdownMenuItem
                            onClick={() => setShowSavedModels(true)}
                            className="text-white hover:bg-white/10"
                          >
                            <Folder className="h-4 w-4 mr-2" />
                            My Models
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/20" />
                          <DropdownMenuItem onClick={logout} className="text-red-400 hover:bg-red-500/10">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        onClick={() => setShowLoginDialog(true)}
                        variant="ghost"
                        className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        <span>Sign In</span>
                      </Button>
                    )}

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
                  <div className="flex flex-col gap-2">
                    {user ? (
                      <>
                        <div className="flex items-center gap-2 text-white/80 px-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <User className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">{user.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowSavedModels(true)
                            setShowMobileMenu(false)
                          }}
                          className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2 justify-start"
                        >
                          <Folder className="h-4 w-4" />
                          My Models
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            logout()
                            setShowMobileMenu(false)
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 justify-start"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowLoginDialog(true)
                          setShowMobileMenu(false)
                        }}
                        className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2 justify-start"
                      >
                        <User className="h-4 w-4" />
                        Sign In
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowInfo(!showInfo)
                        setShowMobileMenu(false)
                      }}
                      className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2 justify-start"
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
                      onClick={handleSaveModel}
                      size="icon"
                      className="rounded-xl bg-black/60 backdrop-blur-xl border border-white/20 hover:bg-black/80 text-white transition-all duration-300"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save this model</p>
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

                    <Button
                      onClick={handleSaveModel}
                      className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl px-6 py-3 flex items-center justify-center gap-3 font-medium shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
                    >
                      <Save className="h-5 w-5" />
                      <span>{user ? "Save Model" : "Sign In to Save"}</span>
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
                  <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
                      <Sparkles className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">AI-Powered Technology</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                      Professional 3D Model Generation
                    </h2>
                    <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                      Transform your creative vision into production-ready 3D assets with enterprise-grade AI technology
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-blue-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardContent className="p-8 relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-300">
                            <Sparkles className="h-7 w-7 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-xl mb-1">AI-Powered Generation</h3>
                            <p className="text-blue-400 text-sm font-medium">Neural Networks</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-base leading-relaxed">
                          Advanced deep learning algorithms analyze your inputs to generate highly detailed 3D models
                          with unprecedented accuracy and realism.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-green-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/10">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardContent className="p-8 relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 group-hover:from-green-500/30 group-hover:to-green-600/30 transition-all duration-300">
                            <Palette className="h-7 w-7 text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-xl mb-1">Multiple Formats</h3>
                            <p className="text-green-400 text-sm font-medium">Universal Export</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-base leading-relaxed">
                          Export in industry-standard formats including GLB, USDZ, FBX, OBJ, and STL for seamless
                          integration across platforms.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-orange-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardContent className="p-8 relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 group-hover:from-orange-500/30 group-hover:to-orange-600/30 transition-all duration-300">
                            <Star className="h-7 w-7 text-orange-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-xl mb-1">Enterprise Quality</h3>
                            <p className="text-orange-400 text-sm font-medium">Production Ready</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-base leading-relaxed">
                          High-resolution textures, optimized geometry, and professional materials suitable for
                          commercial applications.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-purple-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardContent className="p-8 relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all duration-300">
                            <Zap className="h-7 w-7 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-xl mb-1">Lightning Fast</h3>
                            <p className="text-purple-400 text-sm font-medium">Optimized Pipeline</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-base leading-relaxed">
                          Generate complex 3D models in minutes with our optimized AI infrastructure and advanced
                          processing algorithms.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-cyan-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardContent className="p-8 relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 group-hover:from-cyan-500/30 group-hover:to-cyan-600/30 transition-all duration-300">
                            <Eye className="h-7 w-7 text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-xl mb-1">Real-time Preview</h3>
                            <p className="text-cyan-400 text-sm font-medium">Interactive Viewer</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-base leading-relaxed">
                          Inspect your models with our advanced 3D viewer featuring real-time rendering and
                          comprehensive controls.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-teal-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-500/10">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardContent className="p-8 relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 group-hover:from-teal-500/30 group-hover:to-teal-600/30 transition-all duration-300">
                            <Settings className="h-7 w-7 text-teal-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-xl mb-1">Advanced Controls</h3>
                            <p className="text-teal-400 text-sm font-medium">Professional Tools</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-base leading-relaxed">
                          Fine-tune every aspect with professional-grade controls and AI-powered recommendations for
                          optimal results.
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

        {/* Login dialog */}
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />

        {/* Saved models dialog */}
        <SavedModelsDialog open={showSavedModels} onOpenChange={setShowSavedModels} onLoadModel={handleLoadModel} />

        {/* Save model dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-800/95 backdrop-blur-xl border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Save 3D Model
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-name" className="text-white font-medium">
                  Model Name
                </Label>
                <Input
                  id="model-name"
                  placeholder="Enter a name for your model"
                  value={saveModelName}
                  onChange={(e) => setSaveModelName(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white font-medium text-sm">Model Details</Label>
                <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Prompt:</span>
                    <span className="text-white text-right max-w-[200px] truncate">{currentPrompt}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Quality:</span>
                    <span className="text-white">{options.quality.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Format:</span>
                    <span className="text-white">{options.geometry_file_format.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSaveDialog(false)}
                  variant="outline"
                  className="flex-1 bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-600/50 hover:text-white"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveConfirm}
                  disabled={!saveModelName.trim() || isSaving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Model
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
                    Features include multiple export formats, real-time preview, professional-grade quality settings,
                    and user accounts to save your creations.
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
