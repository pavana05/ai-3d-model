"use client"

import React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Upload,
  X,
  ImageIcon,
  Type,
  Settings,
  Sparkles,
  Eye,
  Zap,
  Palette,
  Monitor,
  Smartphone,
  Gamepad2,
  Printer,
  Film,
  Globe,
  Cpu,
  Wand2,
  Target,
  Layers,
  Sliders,
  RotateCcw,
  BarChart3,
  Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { formSchema, type FormValues, validateFormData, qualityPresets } from "@/lib/form-schema"
import { cn } from "@/lib/utils"

interface EnhancedFormProps {
  isLoading?: boolean
  onSubmit: (values: FormValues) => void
  onOpenOptions?: () => void
}

// Error boundary component to catch ResizeObserver errors
class ResizeObserverErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    // Ignore ResizeObserver errors
    if (error.message.includes("ResizeObserver")) {
      this.setState({ hasError: false })
      return
    }
    console.error("Form error:", error)
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the form.</div>
    }

    return this.props.children
  }
}

export default function EnhancedForm({ isLoading = false, onSubmit, onOpenOptions }: EnhancedFormProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [showFacialOptions, setShowFacialOptions] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [realTimePreview, setRealTimePreview] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [estimatedSize, setEstimatedSize] = useState(0)
  const [qualityScore, setQualityScore] = useState(0)
  const [performanceScore, setPerformanceScore] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const calculateTimeoutRef = useRef<NodeJS.Timeout>()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: [],
      prompt: "",
      condition_mode: "concat",
      quality: "medium",
      geometry_file_format: "glb",
      use_hyper: false,
      tier: "Regular",
      TAPose: false,
      material: "PBR",
      mesh_mode: "Quad",
      mesh_simplify: true,
      mesh_smooth: true,
      texture_resolution: "2048",
      lighting_mode: "auto",
      camera_angle: "auto",
      background_removal: true,
      edge_enhancement: false,
      detail_boost: "off",
      detail_enhancement_mode: "all",
      detail_preservation: true,
      surface_refinement: false,
      micro_detail_recovery: false,
      facial_detail_enhancement: false,
      eye_clarity_boost: false,
      facial_feature_sharpening: false,
      skin_texture_enhancement: false,
      facial_symmetry_correction: false,
      skin_tone_adjustment: false,
      hair_detail_enhancement: false,
      expression_enhancement: false,
      age_progression: "none",
      gender_enhancement: "none",
      ai_upscaling: false,
      neural_enhancement: false,
      style_transfer: "none",
      adaptive_lod: false,
      physics_simulation: false,
      animation_ready: false,
      rigging_support: false,
      morph_targets: false,
      uv_optimization: true,
      normal_map_generation: false,
      ambient_occlusion: false,
      subsurface_scattering: false,
      metallic_roughness: false,
      emission_mapping: false,
      displacement_mapping: false,
      parallax_mapping: false,
      multi_material_support: false,
      texture_atlas_optimization: false,
      hdr_lighting: false,
      mesh_compression: "none",
      texture_compression: "none",
      color_space: "sRGB",
      export_variants: ["web"],
      lod_generation: false,
      batch_processing: false,
      version_control: false,
      quality_preset: "custom",
      noise_reduction: false,
      artifact_removal: false,
      topology_optimization: false,
      symmetry_enforcement: false,
      proportions_correction: false,
    },
  })

  // Debounced calculation function to prevent excessive recalculations
  const debouncedCalculateEstimates = useCallback((values: FormValues) => {
    if (calculateTimeoutRef.current) {
      clearTimeout(calculateTimeoutRef.current)
    }

    calculateTimeoutRef.current = setTimeout(() => {
      try {
        // Calculate estimated processing time (in minutes)
        let time = 2 // base time

        if (values.quality === "high") time += 3
        if (values.quality === "ultra") time += 6
        if (values.texture_resolution === "4096") time += 2
        if (values.texture_resolution === "8192") time += 5
        if (values.texture_resolution === "16384") time += 8
        if (values.detail_boost === "high") time += 2
        if (values.detail_boost === "ultra") time += 4
        if (values.detail_boost === "extreme") time += 6
        if (values.facial_detail_enhancement) time += 1
        if (values.ai_upscaling) time += 2
        if (values.neural_enhancement) time += 3

        setEstimatedTime(Math.min(time, 30)) // Cap at 30 minutes

        // Calculate estimated file size (in MB)
        let size = 5 // base size

        if (values.texture_resolution === "1024") size += 5
        if (values.texture_resolution === "2048") size += 10
        if (values.texture_resolution === "4096") size += 25
        if (values.texture_resolution === "8192") size += 60
        if (values.texture_resolution === "16384") size += 120
        if (values.mesh_compression === "none") size *= 1.5
        if (values.mesh_compression === "high") size *= 0.6
        if (values.mesh_compression === "extreme") size *= 0.4
        if (values.normal_map_generation) size += 15
        if (values.displacement_mapping) size += 20

        setEstimatedSize(Math.min(size, 500)) // Cap at 500MB

        // Calculate quality score
        let quality = 50
        if (values.quality === "high") quality += 20
        if (values.quality === "ultra") quality += 35
        if (values.ai_upscaling) quality += 15
        if (values.neural_enhancement) quality += 20
        if (values.detail_boost === "high") quality += 10
        if (values.detail_boost === "ultra") quality += 20
        if (values.detail_boost === "extreme") quality += 25
        if (values.facial_detail_enhancement) quality += 10

        setQualityScore(Math.min(100, quality))

        // Calculate performance score
        let performance = 80
        if (values.mesh_compression !== "none") performance += 10
        if (values.adaptive_lod) performance += 15
        if (values.texture_compression !== "none") performance += 10
        if (values.texture_resolution === "8192") performance -= 20
        if (values.texture_resolution === "16384") performance -= 30
        if (values.detail_boost === "ultra") performance -= 15
        if (values.detail_boost === "extreme") performance -= 25

        setPerformanceScore(Math.max(0, Math.min(100, performance)))
      } catch (error) {
        console.warn("Error calculating estimates:", error)
      }
    }, 300) // 300ms debounce
  }, [])

  // Watch for changes to calculate estimates with debouncing
  const watchedValues = form.watch()
  useEffect(() => {
    debouncedCalculateEstimates(watchedValues)
  }, [watchedValues, debouncedCalculateEstimates])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (calculateTimeoutRef.current) {
        clearTimeout(calculateTimeoutRef.current)
      }
    }
  }, [])

  // Watch for facial-related prompts
  const prompt = form.watch("prompt")
  useEffect(() => {
    try {
      const facialKeywords = [
        "face",
        "head",
        "portrait",
        "person",
        "human",
        "eye",
        "eyes",
        "facial",
        "character",
        "avatar",
      ]
      const hasFacialContent = facialKeywords.some((keyword) => prompt?.toLowerCase().includes(keyword))

      if (hasFacialContent && !showFacialOptions) {
        setShowFacialOptions(true)
        // Auto-enable facial enhancements
        form.setValue("facial_detail_enhancement", true)
        form.setValue("eye_clarity_boost", true)
        form.setValue("facial_feature_sharpening", true)
        form.setValue("skin_texture_enhancement", true)
      }
    } catch (error) {
      console.warn("Error processing prompt:", error)
    }
  }, [prompt, showFacialOptions, form])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      try {
        const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
        if (files.length > 0) {
          const currentImages = form.getValues("images") || []
          const newImages = [...currentImages, ...files].slice(0, 8) // Increased limit
          form.setValue("images", newImages)

          const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
          setPreviewUrls((prev) => [...prev, ...newPreviewUrls].slice(0, 8))
        }
      } catch (error) {
        console.error("Error handling file drop:", error)
      }
    },
    [form],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"))
      if (files.length > 0) {
        const currentImages = form.getValues("images") || []
        const newImages = [...currentImages, ...files].slice(0, 8)
        form.setValue("images", newImages)

        const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
        setPreviewUrls((prev) => [...prev, ...newPreviewUrls].slice(0, 8))
      }
    } catch (error) {
      console.error("Error handling file selection:", error)
    }
  }

  const removeImage = (index: number) => {
    try {
      const currentImages = form.getValues("images") || []
      const newImages = currentImages.filter((_, i) => i !== index)
      form.setValue("images", newImages)

      if (previewUrls[index]) {
        URL.revokeObjectURL(previewUrls[index])
      }
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
    } catch (error) {
      console.error("Error removing image:", error)
    }
  }

  const handleSubmit = (values: FormValues) => {
    try {
      if (!validateFormData(values)) {
        form.setError("prompt", {
          type: "manual",
          message: "Please provide either images or a text prompt",
        })
        return
      }
      onSubmit(values)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const applyQualityPreset = (preset: string) => {
    try {
      if (preset === "custom") return

      const presetConfig = qualityPresets[preset as keyof typeof qualityPresets]
      if (presetConfig) {
        Object.entries(presetConfig).forEach(([key, value]) => {
          form.setValue(key as any, value as any)
        })
        form.setValue("quality_preset", preset as any)
      }
    } catch (error) {
      console.error("Error applying preset:", error)
    }
  }

  const optimizeForFacialModel = () => {
    try {
      form.setValue("quality", "high")
      form.setValue("texture_resolution", "4096")
      form.setValue("detail_boost", "high")
      form.setValue("facial_detail_enhancement", true)
      form.setValue("eye_clarity_boost", true)
      form.setValue("facial_feature_sharpening", true)
      form.setValue("skin_texture_enhancement", true)
      form.setValue("facial_symmetry_correction", true)
      form.setValue("skin_tone_adjustment", true)
      form.setValue("hair_detail_enhancement", true)
      form.setValue("ai_upscaling", true)
      form.setValue("neural_enhancement", true)
      form.setValue("subsurface_scattering", true)
      form.setValue("normal_map_generation", true)
      form.setValue("noise_reduction", true)
      form.setValue("artifact_removal", true)
    } catch (error) {
      console.error("Error optimizing for facial model:", error)
    }
  }

  const resetToDefaults = () => {
    try {
      form.reset()
      setShowFacialOptions(false)
      setShowAdvancedSettings(false)
      // Clean up preview URLs
      previewUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url)
        } catch (e) {
          // Ignore cleanup errors
        }
      })
      setPreviewUrls([])
    } catch (error) {
      console.error("Error resetting form:", error)
    }
  }

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url)
        } catch (e) {
          // Ignore cleanup errors
        }
      })
    }
  }, [])

  return (
    <ResizeObserverErrorBoundary>
      <TooltipProvider>
        <div className="w-full space-y-8">
          {/* Main Form Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-900/98 via-gray-900/98 to-slate-800/98 backdrop-blur-3xl border border-white/20 shadow-2xl">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-cyan-500" />

            <CardHeader className="relative pb-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <CardTitle className="text-3xl font-bold text-white flex items-center gap-4">
                    <div className="relative p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg">
                      <Sparkles className="h-8 w-8 text-blue-400" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                        AI Model Generator
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">Professional</Badge>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                          Enhanced AI
                        </Badge>
                      </div>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                    Create stunning 3D models with advanced AI technology. Professional-grade quality with specialized
                    facial enhancement features.
                  </CardDescription>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  {showFacialOptions && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={optimizeForFacialModel}
                          className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 text-pink-300 hover:bg-pink-500/30 hover:border-pink-400/50 transition-all duration-300"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Optimize for Face
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 border-white/20">
                        <p>Auto-configure all settings for best facial model results</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={resetToDefaults}
                        variant="outline"
                        className="border-white/20 text-white/80 hover:bg-white/10 bg-transparent"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset all settings to defaults</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">
                  {/* Quality Preset Selector */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white">Quick Setup</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {Object.entries({
                        "web-optimized": { icon: Globe, label: "Web", color: "blue" },
                        "mobile-friendly": { icon: Smartphone, label: "Mobile", color: "green" },
                        "desktop-quality": { icon: Monitor, label: "Desktop", color: "purple" },
                        "vr-ready": { icon: Gamepad2, label: "VR/AR", color: "cyan" },
                        "print-quality": { icon: Printer, label: "3D Print", color: "orange" },
                        cinematic: { icon: Film, label: "Cinema", color: "pink" },
                      }).map(([preset, { icon: Icon, label, color }]) => (
                        <Button
                          key={preset}
                          type="button"
                          onClick={() => applyQualityPreset(preset)}
                          variant={form.watch("quality_preset") === preset ? "default" : "outline"}
                          className={cn(
                            "flex flex-col items-center gap-2 h-auto py-4 transition-all duration-300",
                            form.watch("quality_preset") === preset
                              ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                              : "border-white/20 text-white/80 hover:bg-white/10",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  {/* Advanced Tabs */}
                  <Tabs defaultValue="input" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm h-14">
                      <TabsTrigger
                        value="input"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300 flex items-center gap-2"
                      >
                        <Type className="h-4 w-4" />
                        <span className="hidden sm:inline">Input</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="quality"
                        className="data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300 flex items-center gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        <span className="hidden sm:inline">Quality</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="advanced"
                        className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-300 flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">Advanced</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="analytics"
                        className="data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-300 flex items-center gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Analytics</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="input" className="space-y-8 mt-10">
                      {/* Enhanced Image Upload */}
                      <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-semibold text-xl flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                                <ImageIcon className="h-5 w-5 text-blue-400" />
                              </div>
                              Reference Images
                              <Badge className="bg-blue-900/50 text-blue-300 border-blue-500/30">Up to 8 images</Badge>
                            </FormLabel>
                            <FormControl>
                              <div
                                className={cn(
                                  "relative border-2 border-dashed rounded-3xl p-16 transition-all duration-700 cursor-pointer group overflow-hidden",
                                  dragActive
                                    ? "border-blue-400 bg-blue-500/10 scale-[1.02] shadow-2xl shadow-blue-500/20"
                                    : "border-gray-600 hover:border-gray-500 bg-slate-800/30 hover:bg-slate-800/50",
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                              >
                                {/* Animated background effects */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  className="hidden"
                                  disabled={isLoading}
                                />

                                <div className="relative z-10 text-center">
                                  <div className="relative p-6 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 w-fit mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 border border-blue-500/30">
                                    <Upload className="h-16 w-16 text-blue-400 group-hover:text-blue-300 transition-colors" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                  </div>

                                  <h3 className="text-white font-bold text-2xl mb-4">Drop your images here</h3>
                                  <p className="text-gray-400 text-base leading-relaxed mb-6">
                                    Support JPG, PNG, WebP • Multiple angles recommended • Best results with clear,
                                    well-lit photos
                                  </p>

                                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                                      <span>High Quality</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                      <span>AI Enhanced</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                                      <span>Fast Processing</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription className="text-gray-400 text-base">
                              Upload multiple reference images from different angles for best results. Our AI will
                              analyze and combine them intelligently.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Enhanced Image Previews */}
                      {previewUrls.length > 0 && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h3 className="text-white font-semibold text-lg">Uploaded Images</h3>
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                {previewUrls.length}/8
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                previewUrls.forEach((url) => {
                                  try {
                                    URL.revokeObjectURL(url)
                                  } catch (e) {
                                    // Ignore cleanup errors
                                  }
                                })
                                setPreviewUrls([])
                                form.setValue("images", [])
                              }}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Clear All
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {previewUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:border-blue-400/60 group-hover:shadow-2xl group-hover:shadow-blue-500/20">
                                  <img
                                    src={url || "/placeholder.svg"}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Image {index + 1}
                                  </div>
                                </div>
                                {!isLoading && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator className="bg-gradient-to-r from-transparent via-gray-600/50 to-transparent" />

                      {/* Enhanced Text Prompt */}
                      <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-semibold text-xl flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                                <Type className="h-5 w-5 text-purple-400" />
                              </div>
                              Text Description
                              <Badge className="bg-purple-900/50 text-purple-300 border-purple-500/30">
                                {field.value ? "Active" : "Optional"}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Textarea
                                  placeholder="Describe your vision in detail... (e.g., 'A photorealistic human face with crystal clear, bright blue eyes, smooth skin texture, and natural lighting. Focus on facial symmetry and detailed features.')"
                                  className="min-h-[160px] bg-slate-800/60 border-slate-600/60 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20 resize-none rounded-2xl backdrop-blur-sm transition-all duration-300 group-hover:bg-slate-800/80 text-base leading-relaxed"
                                  {...field}
                                />
                                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                  <div className="text-xs text-gray-500">{field.value?.length || 0}/1000</div>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-gray-400 hover:text-white"
                                      >
                                        <Lightbulb className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Click for prompt suggestions</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription className="text-gray-400 text-base">
                              Be specific about details, materials, lighting, and style. For faces, mention eye color,
                              skin tone, expression, and desired clarity level.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="quality" className="space-y-8 mt-10">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                        {/* Core Quality Settings */}
                        <div className="space-y-8">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                              <Zap className="h-5 w-5 text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Core Quality</h3>
                          </div>

                          <div className="space-y-6">
                            <FormField
                              control={form.control}
                              name="quality"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium text-base">
                                    Overall Quality Level
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm h-12 text-base">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                      <SelectItem value="extra-low">Extra Low (2-3 min, 2MB)</SelectItem>
                                      <SelectItem value="low">Low (3-4 min, 5MB)</SelectItem>
                                      <SelectItem value="medium">Medium (4-6 min, 10MB)</SelectItem>
                                      <SelectItem value="high">High (6-9 min, 20MB)</SelectItem>
                                      <SelectItem value="ultra">Ultra (10-15 min, 40MB)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Higher quality takes longer but produces better results
                                  </FormDescription>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="texture_resolution"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium text-base">Texture Resolution</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm h-12 text-base">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                      <SelectItem value="512">512px (Ultra Fast)</SelectItem>
                                      <SelectItem value="1024">1024px (Fast)</SelectItem>
                                      <SelectItem value="2048">2048px (Balanced)</SelectItem>
                                      <SelectItem value="4096">4096px (High Quality)</SelectItem>
                                      <SelectItem value="8192">8192px (Ultra Quality)</SelectItem>
                                      <SelectItem value="16384">16384px (Maximum)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Higher resolution provides more detail but increases file size
                                  </FormDescription>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="detail_boost"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium text-base">Detail Enhancement</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm h-12 text-base">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                      <SelectItem value="off">Off</SelectItem>
                                      <SelectItem value="low">Low (+1 min)</SelectItem>
                                      <SelectItem value="medium">Medium (+2 min)</SelectItem>
                                      <SelectItem value="high">High (+3 min)</SelectItem>
                                      <SelectItem value="ultra">Ultra (+5 min)</SelectItem>
                                      <SelectItem value="extreme">Extreme (+8 min)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>AI-powered detail enhancement for finer features</FormDescription>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Advanced Facial Enhancement */}
                        {showFacialOptions && (
                          <div className="space-y-8">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-rose-500/20">
                                <Eye className="h-5 w-5 text-pink-400" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white">Facial Enhancement</h3>
                                <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 mt-1">
                                  Face Detected
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {[
                                {
                                  key: "facial_detail_enhancement",
                                  label: "Overall Facial Enhancement",
                                  desc: "Enhance all facial features and details",
                                },
                                {
                                  key: "eye_clarity_boost",
                                  label: "Crystal Clear Eyes",
                                  desc: "Specifically enhance eye clarity and brightness",
                                  icon: Eye,
                                },
                                {
                                  key: "facial_feature_sharpening",
                                  label: "Feature Definition",
                                  desc: "Sharpen nose, lips, eyebrows, and jawline",
                                },
                                {
                                  key: "skin_texture_enhancement",
                                  label: "Skin Texture",
                                  desc: "Improve skin surface details and realism",
                                },
                                {
                                  key: "facial_symmetry_correction",
                                  label: "Symmetry Correction",
                                  desc: "Improve facial proportions and balance",
                                },
                                {
                                  key: "skin_tone_adjustment",
                                  label: "Skin Tone Optimization",
                                  desc: "Enhance natural skin coloring",
                                },
                                {
                                  key: "hair_detail_enhancement",
                                  label: "Hair Detail",
                                  desc: "Improve hair texture and individual strands",
                                },
                                {
                                  key: "expression_enhancement",
                                  label: "Expression Clarity",
                                  desc: "Enhance emotional expression and micro-details",
                                },
                              ].map(({ key, label, desc, icon: Icon }) => (
                                <FormField
                                  key={key}
                                  control={form.control}
                                  name={key as any}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-600/60 p-5 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 group">
                                      <div className="space-y-2 flex-1">
                                        <FormLabel className="text-white font-medium text-base flex items-center gap-2">
                                          {Icon && <Icon className="h-4 w-4 text-pink-400" />}
                                          {label}
                                        </FormLabel>
                                        <FormDescription className="text-gray-400 text-sm leading-relaxed">
                                          {desc}
                                        </FormDescription>
                                      </div>
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          className="data-[state=checked]:bg-pink-500"
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              ))}

                              {/* Advanced Facial Controls */}
                              <div className="grid grid-cols-1 gap-4">
                                <FormField
                                  control={form.control}
                                  name="age_progression"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-white font-medium">Age Enhancement</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                          <SelectItem value="none">No Change</SelectItem>
                                          <SelectItem value="younger">Make Younger</SelectItem>
                                          <SelectItem value="older">Make Older</SelectItem>
                                          <SelectItem value="auto">Auto Optimize</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="gender_enhancement"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-white font-medium">Gender Enhancement</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                          <SelectItem value="none">No Enhancement</SelectItem>
                                          <SelectItem value="masculine">Enhance Masculine Features</SelectItem>
                                          <SelectItem value="feminine">Enhance Feminine Features</SelectItem>
                                          <SelectItem value="neutral">Neutral Balance</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-8 mt-10">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                        {/* Material & Rendering */}
                        <div className="space-y-8">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                              <Palette className="h-5 w-5 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Material & Rendering</h3>
                          </div>

                          <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                              <FormField
                                control={form.control}
                                name="material"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Material Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                        <SelectItem value="PBR">PBR (Physically Based)</SelectItem>
                                        <SelectItem value="Shaded">Shaded (Simple)</SelectItem>
                                        <SelectItem value="Unlit">Unlit (Flat)</SelectItem>
                                        <SelectItem value="Toon">Toon (Stylized)</SelectItem>
                                        <SelectItem value="Realistic">Realistic (Advanced)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="geometry_file_format"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Export Format</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                        <SelectItem value="glb">GLB (Recommended)</SelectItem>
                                        <SelectItem value="usdz">USDZ (Apple AR)</SelectItem>
                                        <SelectItem value="fbx">FBX (Animation)</SelectItem>
                                        <SelectItem value="obj">OBJ (Universal)</SelectItem>
                                        <SelectItem value="stl">STL (3D Printing)</SelectItem>
                                        <SelectItem value="ply">PLY (Research)</SelectItem>
                                        <SelectItem value="dae">DAE (Collada)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="style_transfer"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Style Transfer</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                        <SelectItem value="none">No Style Transfer</SelectItem>
                                        <SelectItem value="realistic">Photorealistic</SelectItem>
                                        <SelectItem value="artistic">Artistic</SelectItem>
                                        <SelectItem value="cartoon">Cartoon</SelectItem>
                                        <SelectItem value="anime">Anime</SelectItem>
                                        <SelectItem value="sculpture">Sculpture</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Advanced Material Options */}
                            <div className="space-y-4">
                              {[
                                {
                                  key: "subsurface_scattering",
                                  label: "Subsurface Scattering",
                                  desc: "Realistic skin lighting effects",
                                },
                                {
                                  key: "normal_map_generation",
                                  label: "Normal Maps",
                                  desc: "Surface detail without geometry",
                                },
                                { key: "ambient_occlusion", label: "Ambient Occlusion", desc: "Realistic shadowing" },
                                {
                                  key: "metallic_roughness",
                                  label: "Metallic Roughness",
                                  desc: "PBR material workflow",
                                },
                                { key: "emission_mapping", label: "Emission Maps", desc: "Glowing/emissive surfaces" },
                                {
                                  key: "displacement_mapping",
                                  label: "Displacement Maps",
                                  desc: "True geometric detail",
                                },
                                { key: "parallax_mapping", label: "Parallax Mapping", desc: "Depth illusion effects" },
                                { key: "hdr_lighting", label: "HDR Lighting", desc: "High dynamic range lighting" },
                              ].map(({ key, label, desc }) => (
                                <FormField
                                  key={key}
                                  control={form.control}
                                  name={key as any}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-600/60 p-4 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                                      <div className="space-y-1">
                                        <FormLabel className="text-white font-medium">{label}</FormLabel>
                                        <FormDescription className="text-gray-400 text-sm">{desc}</FormDescription>
                                      </div>
                                      <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* AI & Optimization */}
                        <div className="space-y-8">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                              <Cpu className="h-5 w-5 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">AI & Optimization</h3>
                          </div>

                          <div className="space-y-6">
                            {/* AI Enhancement Options */}
                            <div className="space-y-4">
                              {[
                                { key: "ai_upscaling", label: "AI Upscaling", desc: "Enhance texture quality with AI" },
                                {
                                  key: "neural_enhancement",
                                  label: "Neural Enhancement",
                                  desc: "Advanced AI processing",
                                },
                                {
                                  key: "noise_reduction",
                                  label: "Noise Reduction",
                                  desc: "Remove artifacts and noise",
                                },
                                {
                                  key: "artifact_removal",
                                  label: "Artifact Removal",
                                  desc: "Clean up generation artifacts",
                                },
                                {
                                  key: "topology_optimization",
                                  label: "Topology Optimization",
                                  desc: "Optimize mesh structure",
                                },
                                {
                                  key: "symmetry_enforcement",
                                  label: "Symmetry Enforcement",
                                  desc: "Ensure bilateral symmetry",
                                },
                                {
                                  key: "proportions_correction",
                                  label: "Proportions Correction",
                                  desc: "Fix anatomical proportions",
                                },
                              ].map(({ key, label, desc }) => (
                                <FormField
                                  key={key}
                                  control={form.control}
                                  name={key as any}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-600/60 p-4 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                                      <div className="space-y-1">
                                        <FormLabel className="text-white font-medium">{label}</FormLabel>
                                        <FormDescription className="text-gray-400 text-sm">{desc}</FormDescription>
                                      </div>
                                      <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>

                            {/* Compression Settings */}
                            <div className="space-y-4">
                              <h4 className="text-white font-semibold">Compression & Optimization</h4>

                              <FormField
                                control={form.control}
                                name="mesh_compression"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Mesh Compression</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                        <SelectItem value="none">None (Largest)</SelectItem>
                                        <SelectItem value="low">Low (90% size)</SelectItem>
                                        <SelectItem value="medium">Medium (70% size)</SelectItem>
                                        <SelectItem value="high">High (50% size)</SelectItem>
                                        <SelectItem value="extreme">Extreme (30% size)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="texture_compression"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Texture Compression</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                        <SelectItem value="none">None (Best Quality)</SelectItem>
                                        <SelectItem value="low">Low (95% quality)</SelectItem>
                                        <SelectItem value="medium">Medium (85% quality)</SelectItem>
                                        <SelectItem value="high">High (70% quality)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Performance Options */}
                            <div className="space-y-4">
                              {[
                                {
                                  key: "adaptive_lod",
                                  label: "Adaptive LOD",
                                  desc: "Multiple detail levels for performance",
                                },
                                {
                                  key: "lod_generation",
                                  label: "LOD Generation",
                                  desc: "Generate multiple quality levels",
                                },
                                {
                                  key: "physics_simulation",
                                  label: "Physics Ready",
                                  desc: "Collision meshes and physics",
                                },
                                { key: "animation_ready", label: "Animation Ready", desc: "Optimized for animation" },
                                {
                                  key: "rigging_support",
                                  label: "Rigging Support",
                                  desc: "Bone structure for characters",
                                },
                                {
                                  key: "morph_targets",
                                  label: "Morph Targets",
                                  desc: "Facial expressions and deformation",
                                },
                              ].map(({ key, label, desc }) => (
                                <FormField
                                  key={key}
                                  control={form.control}
                                  name={key as any}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-600/60 p-4 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                                      <div className="space-y-1">
                                        <FormLabel className="text-white font-medium">{label}</FormLabel>
                                        <FormDescription className="text-gray-400 text-sm">{desc}</FormDescription>
                                      </div>
                                      <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-8 mt-10">
                      {/* Real-time Analytics Dashboard */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Performance Metrics */}
                        <Card className="bg-slate-800/40 border-slate-600/60 backdrop-blur-sm">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-white flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-blue-400" />
                              Performance Metrics
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-300">Quality Score</span>
                                  <span className="text-sm font-mono text-green-400">{qualityScore}%</span>
                                </div>
                                <Progress value={qualityScore} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-300">Performance Score</span>
                                  <span className="text-sm font-mono text-blue-400">{performanceScore}%</span>
                                </div>
                                <Progress value={performanceScore} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-300">Estimated Time</span>
                                  <span className="text-sm font-mono text-yellow-400">{estimatedTime} min</span>
                                </div>
                                <Progress value={(estimatedTime / 15) * 100} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-300">File Size</span>
                                  <span className="text-sm font-mono text-purple-400">
                                    {estimatedSize.toFixed(1)} MB
                                  </span>
                                </div>
                                <Progress value={(estimatedSize / 100) * 100} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Settings Summary */}
                        <Card className="bg-slate-800/40 border-slate-600/60 backdrop-blur-sm">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-white flex items-center gap-2">
                              <Settings className="h-5 w-5 text-purple-400" />
                              Current Configuration
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Quality:</span>
                                  <span className="text-white capitalize">{form.watch("quality")}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Resolution:</span>
                                  <span className="text-white">{form.watch("texture_resolution")}px</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Format:</span>
                                  <span className="text-white uppercase">{form.watch("geometry_file_format")}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Material:</span>
                                  <span className="text-white">{form.watch("material")}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Detail Boost:</span>
                                  <span className="text-white capitalize">{form.watch("detail_boost")}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">AI Upscaling:</span>
                                  <span className="text-white">{form.watch("ai_upscaling") ? "On" : "Off"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Facial Enhance:</span>
                                  <span className="text-white">
                                    {form.watch("facial_detail_enhancement") ? "On" : "Off"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Eye Clarity:</span>
                                  <span className="text-white">{form.watch("eye_clarity_boost") ? "On" : "Off"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Active Features Count */}
                            <div className="pt-4 border-t border-slate-600/50">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Active Features:</span>
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  {Object.values(form.watch()).filter((value) => value === true).length} enabled
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Real-time Preview Toggle */}
                      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-500/20">
                                <Eye className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-white font-semibold">Real-time Preview</h3>
                                <p className="text-gray-400 text-sm">See changes as you adjust settings</p>
                              </div>
                            </div>
                            <Switch
                              checked={realTimePreview}
                              onCheckedChange={setRealTimePreview}
                              className="data-[state=checked]:bg-blue-500"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* Enhanced Submit Section */}
                  <div className="space-y-6 pt-10 border-t border-gradient-to-r from-transparent via-white/20 to-transparent">
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-semibold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed group text-lg"
                      >
                        {/* Animated background effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                        <div className="relative flex items-center justify-center gap-3">
                          {isLoading ? (
                            <>
                              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Generating Model...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-6 w-6" />
                              <span>Generate 3D Model</span>
                            </>
                          )}
                        </div>
                      </Button>

                      <div className="flex gap-3">
                        {onOpenOptions && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={onOpenOptions}
                            className="bg-slate-800/60 border-slate-600/60 text-white hover:bg-slate-700/60 hover:border-slate-500/60 px-6 py-6 rounded-2xl backdrop-blur-sm transition-all duration-300"
                          >
                            <Settings className="h-5 w-5 mr-2" />
                            More Options
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                          className="bg-slate-800/60 border-slate-600/60 text-white hover:bg-slate-700/60 hover:border-slate-500/60 px-6 py-6 rounded-2xl backdrop-blur-sm transition-all duration-300"
                        >
                          <Sliders className="h-5 w-5 mr-2" />
                          {showAdvancedSettings ? "Hide" : "Show"} Advanced
                        </Button>
                      </div>
                    </div>

                    {/* Estimated Results */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-xl bg-slate-800/40 border border-slate-600/60">
                        <div className="text-2xl font-bold text-blue-400">{estimatedTime}min</div>
                        <div className="text-xs text-gray-400">Est. Time</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-slate-800/40 border border-slate-600/60">
                        <div className="text-2xl font-bold text-green-400">{estimatedSize.toFixed(1)}MB</div>
                        <div className="text-xs text-gray-400">File Size</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-slate-800/40 border border-slate-600/60">
                        <div className="text-2xl font-bold text-purple-400">{qualityScore}%</div>
                        <div className="text-xs text-gray-400">Quality</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-slate-800/40 border border-slate-600/60">
                        <div className="text-2xl font-bold text-yellow-400">{performanceScore}%</div>
                        <div className="text-xs text-gray-400">Performance</div>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>

            {/* Bottom accent bar */}
            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
          </Card>

          {/* Enhanced Pro Tips Section */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-blue-900/30 border-blue-500/40 backdrop-blur-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-700">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <CardContent className="relative p-10">
              <div className="flex items-start gap-8">
                <div className="relative p-6 rounded-3xl bg-gradient-to-r from-blue-500/30 to-cyan-500/30 flex-shrink-0 border border-blue-500/40 shadow-2xl">
                  <Wand2 className="h-10 w-10 text-blue-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold mb-8 text-3xl bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    Professional Tips for Exceptional Results
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {[
                        {
                          icon: ImageIcon,
                          title: "Multi-Angle Photography",
                          desc: "Upload 4-6 images from different angles for comprehensive coverage",
                          color: "blue",
                        },
                        {
                          icon: Eye,
                          title: "Crystal Clear Eyes",
                          desc: "Enable eye clarity boost and use high-resolution textures for realistic eyes",
                          color: "pink",
                        },
                        {
                          icon: Zap,
                          title: "Quality vs Speed",
                          desc: "Use 'High' quality for faces, 'Medium' for objects, 'Ultra' for hero assets",
                          color: "green",
                        },
                      ].map(({ icon: Icon, title, desc, color }, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 transition-all duration-500 border border-blue-500/20 hover:border-blue-400/40 group/tip"
                        >
                          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/30 to-blue-600/30 group-hover/tip:scale-110 transition-transform duration-300">
                            <Icon className="h-6 w-6 text-blue-300" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-lg mb-2">{title}</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6">
                      {[
                        {
                          icon: Type,
                          title: "Detailed Descriptions",
                          desc: "Be specific about materials, lighting, and style preferences",
                          color: "purple",
                        },
                        {
                          icon: Layers,
                          title: "Layer Your Enhancements",
                          desc: "Combine multiple enhancement features for compound improvements",
                          color: "cyan",
                        },
                        {
                          icon: Target,
                          title: "Purpose-Built Presets",
                          desc: "Use quality presets matched to your intended use case",
                          color: "orange",
                        },
                      ].map(({ icon: Icon, title, desc, color }, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 transition-all duration-500 border border-purple-500/20 hover:border-purple-400/40 group/tip"
                        >
                          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/30 to-purple-600/30 group-hover/tip:scale-110 transition-transform duration-300">
                            <Icon className="h-6 w-6 text-purple-300" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-lg mb-2">{title}</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </ResizeObserverErrorBoundary>
  )
}
