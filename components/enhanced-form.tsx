"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, X, ImageIcon, Type, Settings, Sparkles, Eye, Zap, Palette } from "lucide-react"
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
import { formSchema, type FormValues, validateFormData } from "@/lib/form-schema"
import { cn } from "@/lib/utils"

interface EnhancedFormProps {
  isLoading?: boolean
  onSubmit: (values: FormValues) => void
  onOpenOptions?: () => void
}

export default function EnhancedForm({ isLoading = false, onSubmit, onOpenOptions }: EnhancedFormProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [showFacialOptions, setShowFacialOptions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      mesh_compression: "none",
      color_space: "sRGB",
      export_variants: ["web"],
      batch_processing: false,
      version_control: false,
    },
  })

  // Watch for facial-related prompts to auto-show facial options
  const prompt = form.watch("prompt")
  useEffect(() => {
    const facialKeywords = ["face", "head", "portrait", "person", "human", "eye", "eyes", "facial", "character"]
    const hasFacialContent = facialKeywords.some((keyword) => prompt?.toLowerCase().includes(keyword))

    if (hasFacialContent && !showFacialOptions) {
      setShowFacialOptions(true)
      // Auto-enable facial enhancements for better results
      form.setValue("facial_detail_enhancement", true)
      form.setValue("eye_clarity_boost", true)
      form.setValue("facial_feature_sharpening", true)
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

      const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
      if (files.length > 0) {
        const currentImages = form.getValues("images") || []
        const newImages = [...currentImages, ...files].slice(0, 5) // Limit to 5 images
        form.setValue("images", newImages)

        // Create preview URLs
        const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
        setPreviewUrls((prev) => [...prev, ...newPreviewUrls].slice(0, 5))
      }
    },
    [form],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"))
    if (files.length > 0) {
      const currentImages = form.getValues("images") || []
      const newImages = [...currentImages, ...files].slice(0, 5)
      form.setValue("images", newImages)

      const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls].slice(0, 5))
    }
  }

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || []
    const newImages = currentImages.filter((_, i) => i !== index)
    form.setValue("images", newImages)

    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (values: FormValues) => {
    if (!validateFormData(values)) {
      form.setError("prompt", {
        type: "manual",
        message: "Please provide either images or a text prompt",
      })
      return
    }
    onSubmit(values)
  }

  // Auto-optimize settings for facial models
  const optimizeForFacialModel = () => {
    form.setValue("quality", "high")
    form.setValue("texture_resolution", "4096")
    form.setValue("detail_boost", "high")
    form.setValue("facial_detail_enhancement", true)
    form.setValue("eye_clarity_boost", true)
    form.setValue("facial_feature_sharpening", true)
    form.setValue("skin_texture_enhancement", true)
    form.setValue("facial_symmetry_correction", true)
    form.setValue("ai_upscaling", true)
    form.setValue("neural_enhancement", true)
    form.setValue("subsurface_scattering", true)
    form.setValue("normal_map_generation", true)
  }

  return (
    <TooltipProvider>
      <div className="w-full space-y-6">
        <Card className="group bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-800/95 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                    <Sparkles className="h-6 w-6 text-blue-400" />
                  </div>
                  Generate 3D Model
                </CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Create stunning 3D models from images or text descriptions with AI
                </CardDescription>
              </div>
              {showFacialOptions && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={optimizeForFacialModel}
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-300 hover:bg-pink-500/30 hover:border-pink-400/50 transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Optimize for Face
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 border-white/20">
                    <p>Auto-configure settings for best facial model results</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <Tabs defaultValue="input" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
                    <TabsTrigger
                      value="input"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Type className="h-4 w-4 mr-2" />
                      Input
                    </TabsTrigger>
                    <TabsTrigger
                      value="quality"
                      className="data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Quality
                    </TabsTrigger>
                    <TabsTrigger
                      value="advanced"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="input" className="space-y-6 mt-8">
                    {/* Image Upload */}
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-semibold text-lg flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-blue-400" />
                            Reference Images
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-900/50 text-blue-300 border-blue-500/30"
                            >
                              Optional
                            </Badge>
                          </FormLabel>
                          <FormControl>
                            <div
                              className={cn(
                                "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-500 cursor-pointer group overflow-hidden",
                                dragActive
                                  ? "border-blue-400 bg-blue-500/10 scale-[1.02]"
                                  : "border-gray-600 hover:border-gray-500 bg-slate-800/30 hover:bg-slate-800/50",
                              )}
                              onDragEnter={handleDrag}
                              onDragLeave={handleDrag}
                              onDragOver={handleDrag}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              {/* Background gradient effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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
                                <div className="p-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                  <Upload className="h-12 w-12 text-blue-400 group-hover:text-blue-300 transition-colors" />
                                </div>
                                <p className="text-white font-semibold text-lg mb-3">
                                  Drop images here or click to browse
                                </p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                  Support JPG, PNG, WebP • Max 5 images • Best results with clear, well-lit photos
                                </p>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-gray-400 text-sm">
                            Upload reference images to guide the 3D model generation process
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold">Uploaded Images</h3>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            {previewUrls.length}/5
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-white/20 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-blue-400/60">
                                <img
                                  src={url || "/placeholder.svg"}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                              {!isLoading && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
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

                    <Separator className="bg-gradient-to-r from-transparent via-gray-600 to-transparent" />

                    {/* Text Prompt */}
                    <FormField
                      control={form.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-semibold text-lg flex items-center gap-2">
                            <Type className="h-5 w-5 text-purple-400" />
                            Text Description
                            <Badge
                              variant="secondary"
                              className="text-xs bg-purple-900/50 text-purple-300 border-purple-500/30"
                            >
                              {field.value ? "Active" : "Optional"}
                            </Badge>
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Textarea
                                placeholder="Describe what you want to create... (e.g., 'A detailed human face with clear, bright eyes and realistic skin texture')"
                                className="min-h-[140px] bg-slate-800/60 border-slate-600/60 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20 resize-none rounded-xl backdrop-blur-sm transition-all duration-300 group-hover:bg-slate-800/80"
                                {...field}
                              />
                              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                                {field.value?.length || 0}/500
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-gray-400 text-sm">
                            Provide a detailed description. For faces, mention specific features like "clear eyes",
                            "detailed skin texture", etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="quality" className="space-y-8 mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Quality Settings */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                            <Zap className="h-5 w-5 text-yellow-400" />
                          </div>
                          Quality Settings
                        </h3>

                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="quality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium">Overall Quality</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                    <SelectItem value="extra-low">Extra Low (Fast)</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium (Recommended)</SelectItem>
                                    <SelectItem value="high">High (Best for faces)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="texture_resolution"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium">Texture Resolution</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                    <SelectItem value="1024">1024px (Low)</SelectItem>
                                    <SelectItem value="2048">2048px (Medium)</SelectItem>
                                    <SelectItem value="4096">4096px (High - Best for faces)</SelectItem>
                                    <SelectItem value="8192">8192px (Ultra)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="detail_boost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium">Detail Enhancement</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-white backdrop-blur-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                                    <SelectItem value="off">Off</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High (Recommended for faces)</SelectItem>
                                    <SelectItem value="ultra">Ultra</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Facial Enhancement Options */}
                      {showFacialOptions && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-6">
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
                            <FormField
                              control={form.control}
                              name="facial_detail_enhancement"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-600/60 p-4 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                                  <div className="space-y-1">
                                    <FormLabel className="text-white font-medium">Facial Detail Enhancement</FormLabel>
                                    <FormDescription className="text-gray-400 text-sm">
                                      Enhance overall facial features and details
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="eye_clarity_boost"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-600/60 p-4 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                                  <div className="space-y-1">
                                    <FormLabel className="text-white font-medium flex items-center gap-2">
                                      <Eye className="h-4 w-4 text-blue-400" />
                                      Eye Clarity Boost
                                    </FormLabel>
                                    <FormDescription className="text-gray-400 text-sm">
                                      Specifically enhance eye details and clarity
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="facial_feature_sharpening"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-600/60 p-4 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                                  <div className="space-y-1">
                                    <FormLabel className="text-white font-medium">Feature Sharpening</FormLabel>
                                    <FormDescription className="text-gray-400 text-sm">
                                      Sharpen facial features like nose, lips, eyebrows
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="skin_texture_enhancement"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-600/60 p-4 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                                  <div className="space-y-1">
                                    <FormLabel className="text-white font-medium">Skin Texture Enhancement</FormLabel>
                                    <FormDescription className="text-gray-400 text-sm">
                                      Improve skin texture and surface details
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="facial_symmetry_correction"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-600/60 p-4 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                                  <div className="space-y-1">
                                    <FormLabel className="text-white font-medium">Symmetry Correction</FormLabel>
                                    <FormDescription className="text-gray-400 text-sm">
                                      Improve facial symmetry and proportions
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-8 mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Material & Export */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                            <Palette className="h-5 w-5 text-purple-400" />
                          </div>
                          Material & Export
                        </h3>

                        <div className="space-y-4">
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
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* AI Enhancement */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                            <Sparkles className="h-5 w-5 text-blue-400" />
                          </div>
                          AI Enhancement
                        </h3>

                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="ai_upscaling"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-600/60 p-4 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                                <div className="space-y-1">
                                  <FormLabel className="text-white font-medium">AI Upscaling</FormLabel>
                                  <FormDescription className="text-gray-400 text-sm">
                                    Enhance texture quality with AI
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="neural_enhancement"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-600/60 p-4 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                                <div className="space-y-1">
                                  <FormLabel className="text-white font-medium">Neural Enhancement</FormLabel>
                                  <FormDescription className="text-gray-400 text-sm">
                                    Advanced AI processing for better results
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="subsurface_scattering"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-600/60 p-4 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                                <div className="space-y-1">
                                  <FormLabel className="text-white font-medium">Subsurface Scattering</FormLabel>
                                  <FormDescription className="text-gray-400 text-sm">
                                    Realistic skin lighting (great for faces)
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="normal_map_generation"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-600/60 p-4 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                                <div className="space-y-1">
                                  <FormLabel className="text-white font-medium">Normal Map Generation</FormLabel>
                                  <FormDescription className="text-gray-400 text-sm">
                                    Add surface detail without extra geometry
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gradient-to-r from-transparent via-gray-600/50 to-transparent">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-xl hover:shadow-blue-500/30 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                        Generating Model...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-3" />
                        Generate 3D Model
                      </>
                    )}
                  </Button>

                  {onOpenOptions && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onOpenOptions}
                      className="bg-slate-800/60 border-slate-600/60 text-white hover:bg-slate-700/60 hover:border-slate-500/60 px-6 py-4 rounded-xl backdrop-blur-sm transition-all duration-300"
                    >
                      <Settings className="h-5 w-5 mr-2" />
                      More Options
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Enhanced Tips Section */}
        <Card className="group bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-blue-900/30 border-blue-500/40 backdrop-blur-xl shadow-xl hover:shadow-blue-500/20 transition-all duration-500">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/30 to-cyan-500/30 flex-shrink-0 border border-blue-500/40 shadow-lg">
                <Sparkles className="h-8 w-8 text-blue-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-6 text-2xl bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  Pro Tips for Amazing Results
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-gray-300">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300 border border-blue-500/20 hover:border-blue-400/40">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/30 to-cyan-500/30">
                        <ImageIcon className="h-5 w-5 text-blue-300" />
                      </div>
                      <span className="font-semibold">Upload multiple angles for better accuracy</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 border border-purple-500/20 hover:border-purple-400/40">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/30 to-pink-500/30">
                        <Zap className="h-5 w-5 text-purple-300" />
                      </div>
                      <span className="font-semibold">Use clear, well-lit photos</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 transition-all duration-300 border border-pink-500/20 hover:border-pink-400/40">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500/30 to-rose-500/30">
                        <Eye className="h-5 w-5 text-pink-300" />
                      </div>
                      <span className="font-semibold">Enable eye clarity boost for faces</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-teal-500/10 hover:from-cyan-500/20 hover:to-teal-500/20 transition-all duration-300 border border-cyan-500/20 hover:border-cyan-400/40">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/30 to-teal-500/30">
                        <Type className="h-5 w-5 text-cyan-300" />
                      </div>
                      <span className="font-semibold">Be specific about shape and style</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
