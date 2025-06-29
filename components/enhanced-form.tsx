"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type * as z from "zod"
import { Form as UIForm } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Settings2, Send, X, CloudUpload, Sparkles, Zap, Camera, Palette, Layers3, Plus, ImageIcon } from "lucide-react"
import AutoResizeTextarea from "./auto-resize-textarea"
import { formSchema } from "@/lib/form-schema"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import EnhancedProgressBar from "./enhanced-progress-bar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EnhancedFormProps {
  isLoading: boolean
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  onOpenOptions: () => void
}

export default function EnhancedForm({ isLoading, onSubmit, onOpenOptions }: EnhancedFormProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [animateSubmit, setAnimateSubmit] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const dragCounter = useRef(0)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      images: [],
      condition_mode: "concat",
      quality: "medium",
      geometry_file_format: "glb",
      use_hyper: false,
      tier: "Regular",
      TAPose: false,
      material: "PBR",
    },
  })

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addImages(files)
  }, [])

  const addImages = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return

      setError(null)
      setIsUploading(true)
      setUploadProgress(0)

      const validFiles = files.filter((file) => {
        if (!file.type.startsWith("image/")) {
          setError("Please upload only image files (JPG, PNG, WebP, etc.)")
          return false
        }
        if (file.size > 10 * 1024 * 1024) {
          setError("Image files must be smaller than 10MB")
          return false
        }
        return true
      })

      if (validFiles.length === 0) {
        setIsUploading(false)
        return
      }

      const currentImages = form.getValues("images") || []
      const totalImages = currentImages.length + validFiles.length

      if (totalImages > 5) {
        setError("You can upload a maximum of 5 images")
        const allowedNewImages = 5 - currentImages.length
        validFiles.splice(allowedNewImages)

        if (validFiles.length === 0) {
          setIsUploading(false)
          return
        }
      }

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + Math.random() * 15 + 5
        })
      }, 150)

      try {
        const newPreviewUrls = await Promise.all(
          validFiles.map(async (file) => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.readAsDataURL(file)
            })
          }),
        )

        const updatedImages = [...currentImages, ...validFiles]
        setPreviewUrls([...previewUrls, ...newPreviewUrls])
        form.setValue("images", updatedImages)

        setUploadProgress(100)
        setTimeout(() => {
          setUploadProgress(0)
          setIsUploading(false)
        }, 500)
      } catch (err) {
        setError("Failed to process images. Please try again.")
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [form, previewUrls],
  )

  const removeImage = useCallback(
    (index: number) => {
      const currentImages = form.getValues("images") || []
      const newImages = [...currentImages]
      newImages.splice(index, 1)

      const newPreviewUrls = [...previewUrls]
      if (newPreviewUrls[index]?.startsWith("data:")) {
        // Only revoke blob URLs, not data URLs
      } else {
        URL.revokeObjectURL(newPreviewUrls[index])
      }
      newPreviewUrls.splice(index, 1)

      setPreviewUrls(newPreviewUrls)
      form.setValue("images", newImages)
      setError(null)
    },
    [form, previewUrls],
  )

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounter.current = 0
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
        addImages(files)
      }
    },
    [addImages],
  )

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        if (!isMobile && !e.shiftKey) {
          e.preventDefault()
          formRef.current?.requestSubmit()
        }
      }
    },
    [isMobile],
  )

  const handleSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      try {
        setError(null)
        setAnimateSubmit(true)
        await onSubmit(values)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setAnimateSubmit(false)
      }
    },
    [onSubmit],
  )

  const promptValue = form.watch("prompt")
  const hasImages = previewUrls.length > 0
  const canSubmit = (promptValue && promptValue.trim().length > 0) || hasImages

  return (
    <TooltipProvider>
      <div className="w-full max-w-5xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20 backdrop-blur-sm">
            <div className="p-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600">
              <Layers3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              AI-Powered 3D Generation
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Create Stunning 3D Models
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Transform your ideas into professional 3D models using advanced AI technology
          </p>
        </div>

        <UIForm {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="relative">
            <div
              ref={dropAreaRef}
              className={cn(
                "relative bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-slate-800/90 backdrop-blur-3xl rounded-3xl overflow-hidden transition-all duration-700 shadow-2xl border",
                isDragging
                  ? "ring-2 ring-violet-400/60 border-violet-400/60 shadow-violet-500/30 scale-[1.02] bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-fuchsia-900/20"
                  : isFocused
                    ? "ring-1 ring-white/30 border-white/30 shadow-white/10"
                    : "border-white/20 hover:border-white/30 hover:shadow-xl",
                isLoading && "animate-pulse pointer-events-none opacity-70",
                animateSubmit && "animate-pulse scale-[0.98]",
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Responsive animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/3 via-purple-500/3 to-fuchsia-500/3 sm:from-violet-500/5 sm:via-purple-500/5 sm:to-fuchsia-500/5 opacity-40 sm:opacity-60 animate-pulse pointer-events-none will-change-transform" />

              {/* Upload progress bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute top-0 left-0 right-0 z-20">
                  <EnhancedProgressBar
                    value={uploadProgress}
                    size="sm"
                    animated={true}
                    variant="default"
                    className="rounded-none bg-gradient-to-r from-violet-500 to-purple-600"
                  />
                </div>
              )}

              {/* Image previews */}
              {hasImages && (
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-gray-800/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600">
                      <ImageIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Uploaded Images</h3>
                      <p className="text-sm text-gray-400">Ready for 3D generation</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-auto bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30"
                    >
                      {previewUrls.length}/5 Images
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {previewUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative group animate-in zoom-in duration-500"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:border-violet-400/60 group-hover:rotate-1">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={() => {
                              console.error(`Failed to load image preview ${index + 1}`)
                              removeImage(index)
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                          {!isLoading && !isUploading && (
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-lg hover:scale-110 z-10 border border-white/20"
                              aria-label={`Remove image ${index + 1}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-gradient-to-r from-slate-800 to-gray-800 text-white border border-white/30 backdrop-blur-sm shadow-lg"
                          >
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {/* Add more images button */}
                    {previewUrls.length < 5 && (
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        disabled={isLoading || isUploading}
                        className="aspect-square rounded-2xl border-2 border-dashed border-violet-400/40 hover:border-violet-400/80 bg-gradient-to-br from-violet-500/5 to-purple-500/5 hover:from-violet-500/10 hover:to-purple-500/10 transition-all duration-500 flex items-center justify-center group hover:scale-105"
                      >
                        <div className="text-center">
                          <div className="p-3 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 group-hover:from-violet-500/30 group-hover:to-purple-500/30 transition-all duration-300 mb-2">
                            <Plus className="h-6 w-6 text-violet-400 group-hover:text-violet-300 transition-colors" />
                          </div>
                          <span className="text-xs text-violet-400 group-hover:text-violet-300 font-medium transition-colors">
                            Add Image
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Main input area */}
              <div className="p-8 px-7">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 sm:gap-6">
                  {/* Action buttons */}
                  <div className="flex flex-row sm:flex-col gap-3 justify-center sm:justify-start">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isLoading || isUploading}
                      aria-label="Upload images"
                    />

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={triggerFileInput}
                          className={cn(
                            "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-blue-500/15 via-blue-500/10 to-cyan-500/15 hover:from-blue-500/25 hover:via-blue-500/20 hover:to-cyan-500/25 border-2 border-blue-500/30 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 sm:hover:scale-110 hover:rotate-3 shadow-lg hover:shadow-blue-500/25 backdrop-blur-sm",
                            previewUrls.length >= 5 && "opacity-50 cursor-not-allowed",
                            isUploading && "animate-pulse",
                          )}
                          disabled={isLoading || isUploading || previewUrls.length >= 5}
                        >
                          {isUploading ? (
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-2 border-blue-400 border-t-transparent" />
                          ) : (
                            <CloudUpload className="h-6 w-6 sm:h-7 sm:w-7 text-blue-400" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 border-white/20 shadow-xl">
                        <p>{previewUrls.length >= 5 ? "Maximum 5 images allowed" : "Upload reference images"}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={onOpenOptions}
                          className={cn(
                            "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-purple-500/15 via-purple-500/10 to-pink-500/15 hover:from-purple-500/25 hover:via-purple-500/20 hover:to-pink-500/25 border-2 border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 sm:hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm",
                            isLoading && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <Settings2 className="h-6 w-6 sm:h-7 sm:w-7 text-purple-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 border-white/20 shadow-xl">
                        <p>Advanced settings & AI recommendations</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Enhanced text input area */}
                  <div className="flex-1 relative">
                    <div className="relative group">
                      {/* Input container with enhanced styling */}
                      <div
                        className={cn(
                          "relative rounded-2xl bg-gradient-to-br from-slate-800/60 via-gray-800/60 to-slate-700/60 backdrop-blur-xl border-2 transition-all duration-500 shadow-xl",
                          isFocused
                            ? "border-white/40 shadow-white/10 bg-gradient-to-br from-slate-800/80 via-gray-800/80 to-slate-700/80"
                            : "border-white/20 hover:border-white/30",
                        )}
                      >
                        {/* Subtle inner glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

                        <AutoResizeTextarea
                          placeholder={isMobile ? "Describe your 3D model..." : "Describe your 3D model in detail..."}
                          className="w-full bg-transparent border-0 focus:ring-0 text-white placeholder:text-gray-400 py-5 sm:py-6 px-6 sm:px-8 resize-none text-base sm:text-lg lg:text-xl min-h-[60px] sm:min-h-[80px] transition-all duration-300 rounded-2xl focus:bg-transparent font-medium leading-relaxed"
                          {...form.register("prompt")}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          disabled={isLoading}
                          maxLength={500}
                        />

                        {/* Enhanced character count */}
                        {promptValue && (
                          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
                            <span
                              className={cn(
                                "text-xs font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-md transition-all duration-300 border shadow-lg",
                                promptValue.length > 450
                                  ? "text-red-300 bg-red-900/40 border-red-500/40 shadow-red-500/20"
                                  : promptValue.length > 400
                                    ? "text-yellow-300 bg-yellow-900/40 border-yellow-500/40 shadow-yellow-500/20"
                                    : "text-gray-300 bg-gray-900/40 border-gray-500/40 shadow-gray-500/20",
                              )}
                            >
                              {promptValue.length}/500
                            </span>
                          </div>
                        )}

                        {/* Typing indicator line */}
                        {isFocused && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse" />
                        )}
                      </div>

                      {/* Professional enhancement: subtle corner accents */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-white/30 rounded-tl-lg transition-all duration-500 group-hover:border-white/50" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-white/30 rounded-tr-lg transition-all duration-500 group-hover:border-white/50" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-white/30 rounded-bl-lg transition-all duration-500 group-hover:border-white/50" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-white/30 rounded-br-lg transition-all duration-500 group-hover:border-white/50" />
                    </div>
                  </div>

                  {/* Enhanced submit button */}
                  <div className="flex justify-center sm:justify-start">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="submit"
                          className={cn(
                            "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl p-0 flex items-center justify-center transition-all duration-700 shadow-xl border-2 relative overflow-hidden group",
                            canSubmit && !isLoading
                              ? "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 sm:hover:scale-110 border-emerald-400/60 hover:border-emerald-300/80"
                              : "bg-gray-600/50 text-gray-400 cursor-not-allowed border-gray-500/30",
                            animateSubmit && "animate-spin",
                          )}
                          disabled={isLoading || !canSubmit}
                        >
                          {/* Button shine effect */}
                          {canSubmit && !isLoading && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          )}

                          {isLoading ? (
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-2 border-white border-t-transparent" />
                          ) : (
                            <Send className="h-6 w-6 sm:h-7 sm:w-7 relative z-10" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 border-white/20 shadow-xl">
                        <p>{!canSubmit ? "Enter a prompt or upload images to generate" : "Generate 3D model"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Enhanced drag overlay */}
              {isDragging && (
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/95 via-purple-900/95 to-fuchsia-900/95 flex items-center justify-center pointer-events-none z-30 border-4 border-dashed border-violet-400 rounded-3xl">
                  <div className="text-center animate-in zoom-in duration-500">
                    <div className="mb-6 p-8 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 backdrop-blur-sm mx-auto w-fit animate-bounce border border-violet-400/30">
                      <CloudUpload className="h-16 w-16 text-violet-300" />
                    </div>
                    <p className="text-white font-bold text-2xl sm:text-3xl mb-3">Drop your images here</p>
                    <p className="text-violet-200 text-lg">Up to 5 images, 10MB each</p>
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-violet-400 rounded-full animate-ping" />
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping delay-100" />
                      <div className="w-3 h-3 bg-fuchsia-400 rounded-full animate-ping delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </UIForm>

        {/* Enhanced error message */}
        {error && (
          <Card className="bg-gradient-to-r from-red-900/30 to-pink-900/30 border-red-500/40 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 text-red-300">
                <div className="p-3 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 animate-pulse">
                  <X className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg mb-1">Upload Error</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
                <Button
                  onClick={() => setError(null)}
                  variant="ghost"
                  size="sm"
                  className="text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced tips section */}
        {!hasImages && !promptValue && !isLoading && (
          <Card className="bg-gradient-to-r from-slate-900/60 via-gray-900/60 to-slate-800/60 border-white/10 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom duration-700">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex-shrink-0 border border-blue-500/30">
                  <Sparkles className="h-8 w-8 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-6 text-xl sm:text-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Pro Tips for Amazing Results
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300 border border-blue-500/20 hover:border-blue-400/30">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                        <Camera className="h-5 w-5 text-blue-400" />
                      </div>
                      <span>Upload multiple angles for better accuracy</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 border border-purple-500/20 hover:border-purple-400/30">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                        <Zap className="h-5 w-5 text-purple-400" />
                      </div>
                      <span>Use clear, well-lit photos</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 transition-all duration-300 border border-pink-500/20 hover:border-pink-400/30">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-rose-500/20">
                        <Palette className="h-5 w-5 text-pink-400" />
                      </div>
                      <span>Describe materials and textures</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-teal-500/10 hover:from-cyan-500/20 hover:to-teal-500/20 transition-all duration-300 border border-cyan-500/20 hover:border-cyan-400/30">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-teal-500/20">
                        <Layers3 className="h-5 w-5 text-cyan-400" />
                      </div>
                      <span>Be specific about shape and style</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
