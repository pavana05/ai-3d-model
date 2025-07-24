"use client"

import type React from "react"

import { X, ImageIcon } from "lucide-react"
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ImageUploadAreaProps {
  previewUrls?: string[]
  onRemoveImage?: (index: number) => void
  isLoading?: boolean
  onImageUpload?: (file: File) => void
  onImageRemove?: () => void
  uploadedImage?: File | null
  disabled?: boolean
}

export default function ImageUploadArea({
  previewUrls = [],
  onRemoveImage,
  isLoading = false,
  onImageUpload,
  onImageRemove,
  uploadedImage,
  disabled = false,
}: ImageUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Handle the case where we have an uploaded image (single image mode)
  if (uploadedImage && !previewUrl) {
    const url = URL.createObjectURL(uploadedImage)
    setPreviewUrl(url)
  }

  // Handle the case where we have preview URLs (multiple images mode)
  if (previewUrls.length === 0 && !uploadedImage && !previewUrl) {
    return null
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith("image/")) return

    if (onImageUpload) {
      onImageUpload(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled || isLoading) return
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !isLoading) {
      setDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (onImageRemove) {
      onImageRemove()
    }
  }

  // Single image mode (for enhanced form)
  if (uploadedImage || previewUrl) {
    return (
      <div className="space-y-4">
        {(uploadedImage || previewUrl) && (
          <div className="relative w-full h-48 rounded-lg border-2 border-gray-200 overflow-hidden">
            <img
              src={previewUrl || (uploadedImage ? URL.createObjectURL(uploadedImage) : "")}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
            {!disabled && !isLoading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {!uploadedImage && !previewUrl && (
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={disabled}
            />

            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Drop an image here, or click to browse</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 10MB</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Multiple images mode (for original form)
  return (
    <div className="flex flex-wrap gap-2 px-4 pt-3 pointer-events-auto">
      {previewUrls.map((url, index) => (
        <div key={index} className="relative h-16 w-16">
          <img
            src={url || "/placeholder.svg"}
            alt={`Preview ${index + 1}`}
            className="h-full w-full object-cover rounded-full"
          />
          {!isLoading && onRemoveImage && (
            <button type="button" onClick={() => onRemoveImage(index)} className="absolute -top-1 -right-1">
              <X className="h-3 w-3 text-white" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
