"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import AIRecommendations from "./ai-recommendations"
import SmartOptionsPanel from "./smart-options-panel"
import { Zap, Grid3X3, Smartphone, Monitor, Printer, Sparkles, Brain } from "lucide-react"

interface OptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: any
  onOptionsChange: (options: any) => void
  prompt?: string
  images?: File[]
}

export default function OptionsDialog({
  open,
  onOpenChange,
  options,
  onOptionsChange,
  prompt = "",
  images = [],
}: OptionsDialogProps) {
  const [localOptions, setLocalOptions] = useState(options)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Update local options when props change
  useEffect(() => {
    setLocalOptions(options)
  }, [options])

  const handleChange = (key: string, value: any) => {
    setLocalOptions((prev: any) => {
      const updated = { ...prev, [key]: value }
      onOptionsChange(updated)
      return updated
    })
  }

  const handleExportVariantChange = (variant: string, checked: boolean) => {
    const currentVariants = localOptions.export_variants || []
    const newVariants = checked ? [...currentVariants, variant] : currentVariants.filter((v: string) => v !== variant)
    handleChange("export_variants", newVariants)
  }

  const content = (
    <div className="py-2">
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="recommendations" className="tracking-normal text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI
          </TabsTrigger>
          <TabsTrigger value="smart" className="tracking-normal text-xs">
            <Brain className="h-3 w-3 mr-1" />
            Smart
          </TabsTrigger>
          <TabsTrigger value="basic" className="tracking-normal text-xs">
            Basic
          </TabsTrigger>
          <TabsTrigger value="advanced" className="tracking-normal text-xs">
            Advanced
          </TabsTrigger>
          <TabsTrigger value="professional" className="tracking-normal text-xs">
            Pro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <AIRecommendations
            prompt={prompt}
            images={images}
            currentOptions={localOptions}
            onApplyRecommendation={(settings) => {
              const newOptions = { ...localOptions, ...settings }
              setLocalOptions(newOptions)
              onOptionsChange(newOptions)
            }}
          />
        </TabsContent>

        <TabsContent value="smart" className="space-y-4">
          <SmartOptionsPanel
            currentOptions={localOptions}
            onOptionsChange={(newOptions) => {
              setLocalOptions(newOptions)
              onOptionsChange(newOptions)
            }}
          />
        </TabsContent>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white font-mono tracking-normal">Quality</Label>
              <Select value={localOptions.quality} onValueChange={(value) => handleChange("quality", value)}>
                <SelectTrigger className="bg-black border-[rgba(255,255,255,0.12)] text-white tracking-normal">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent className="bg-black border-[rgba(255,255,255,0.12)] text-white">
                  <SelectItem value="high" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    High (50k vertices)
                  </SelectItem>
                  <SelectItem value="medium" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    Medium (18k vertices)
                  </SelectItem>
                  <SelectItem value="low" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    Low (8k vertices)
                  </SelectItem>
                  <SelectItem value="extra-low" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    Extra Low (4k vertices)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-mono tracking-normal">Format</Label>
              <Select
                value={localOptions.geometry_file_format}
                onValueChange={(value) => handleChange("geometry_file_format", value)}
              >
                <SelectTrigger className="bg-black border-[rgba(255,255,255,0.12)] text-white tracking-normal">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-black border-[rgba(255,255,255,0.12)] text-white">
                  <SelectItem value="glb" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    GLB (Recommended)
                  </SelectItem>
                  <SelectItem value="usdz" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    USDZ (Apple AR)
                  </SelectItem>
                  <SelectItem value="fbx" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    FBX (Animation)
                  </SelectItem>
                  <SelectItem value="obj" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    OBJ (Universal)
                  </SelectItem>
                  <SelectItem value="stl" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    STL (3D Print)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white font-mono tracking-normal">Texture Resolution</Label>
              <Select
                value={localOptions.texture_resolution}
                onValueChange={(value) => handleChange("texture_resolution", value)}
              >
                <SelectTrigger className="bg-black border-[rgba(255,255,255,0.12)] text-white tracking-normal">
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent className="bg-black border-[rgba(255,255,255,0.12)] text-white">
                  <SelectItem value="1024" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    1K (1024×1024)
                  </SelectItem>
                  <SelectItem value="2048" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    2K (2048×2048)
                  </SelectItem>
                  <SelectItem value="4096" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    4K (4096×4096)
                  </SelectItem>
                  <SelectItem value="8192" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    8K (8192×8192)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-mono tracking-normal">Lighting Mode</Label>
              <Select
                value={localOptions.lighting_mode}
                onValueChange={(value) => handleChange("lighting_mode", value)}
              >
                <SelectTrigger className="bg-black border-[rgba(255,255,255,0.12)] text-white tracking-normal">
                  <SelectValue placeholder="Select lighting" />
                </SelectTrigger>
                <SelectContent className="bg-black border-[rgba(255,255,255,0.12)] text-white">
                  <SelectItem value="auto" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    Auto
                  </SelectItem>
                  <SelectItem value="studio" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    Studio
                  </SelectItem>
                  <SelectItem value="outdoor" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    Outdoor
                  </SelectItem>
                  <SelectItem value="indoor" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    Indoor
                  </SelectItem>
                  <SelectItem value="dramatic" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    Dramatic
                  </SelectItem>
                  <SelectItem value="soft" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    Soft
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-[rgba(255,255,255,0.12)] bg-black/50">
              <div>
                <Label className="text-white font-mono tracking-normal">Use Hyper</Label>
                <p className="text-gray-400 text-xs tracking-normal">Enhanced AI processing</p>
              </div>
              <Switch
                checked={localOptions.use_hyper}
                onCheckedChange={(checked) => handleChange("use_hyper", checked)}
              />
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-[rgba(255,255,255,0.12)] bg-black/50">
              <div>
                <Label className="text-white font-mono tracking-normal">T/A Pose</Label>
                <p className="text-gray-400 text-xs tracking-normal">For human figures</p>
              </div>
              <Switch checked={localOptions.TAPose} onCheckedChange={(checked) => handleChange("TAPose", checked)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          {/* Advanced settings content - keeping existing implementation */}
          <div className="space-y-2">
            <Label className="text-white font-mono tracking-normal">Condition Mode</Label>
            <RadioGroup
              value={localOptions.condition_mode}
              onValueChange={(value) => handleChange("condition_mode", value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="concat" id="concat" className="border-white text-white" />
                <Label htmlFor="concat" className="text-white tracking-normal">
                  Concat (Single object, multiple views)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fuse" id="fuse" className="border-white text-white" />
                <Label htmlFor="fuse" className="text-white tracking-normal">
                  Fuse (Multiple objects combined)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator className="bg-white/10" />

          <div className="space-y-2">
            <Label className="text-white font-mono tracking-normal">Camera Angle</Label>
            <Select value={localOptions.camera_angle} onValueChange={(value) => handleChange("camera_angle", value)}>
              <SelectTrigger className="bg-black border-[rgba(255,255,255,0.12)] text-white tracking-normal">
                <SelectValue placeholder="Select angle" />
              </SelectTrigger>
              <SelectContent className="bg-black border-[rgba(255,255,255,0.12)] text-white">
                <SelectItem value="auto" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                  Auto (AI Optimized)
                </SelectItem>
                <SelectItem value="front" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                  Front View
                </SelectItem>
                <SelectItem value="side" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                  Side Profile
                </SelectItem>
                <SelectItem value="top" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                  Top Down
                </SelectItem>
                <SelectItem value="diagonal" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                  Diagonal
                </SelectItem>
                <SelectItem value="isometric" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                  Isometric
                </SelectItem>
                <SelectItem value="perspective" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                  Perspective
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="professional" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label className="text-white font-mono tracking-normal mb-3 block">Export Variants</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "web", label: "Web", icon: <Monitor className="h-4 w-4" /> },
                  { id: "mobile", label: "Mobile", icon: <Smartphone className="h-4 w-4" /> },
                  { id: "desktop", label: "Desktop", icon: <Monitor className="h-4 w-4" /> },
                  { id: "vr", label: "VR", icon: <Zap className="h-4 w-4" /> },
                  { id: "ar", label: "AR", icon: <Grid3X3 className="h-4 w-4" /> },
                  { id: "print", label: "3D Print", icon: <Printer className="h-4 w-4" /> },
                ].map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center space-x-2 p-3 rounded-lg border border-white/10 bg-black/30"
                  >
                    <Checkbox
                      id={variant.id}
                      checked={localOptions.export_variants?.includes(variant.id as any) || false}
                      onCheckedChange={(checked) => handleExportVariantChange(variant.id, checked as boolean)}
                      className="border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <div className="flex items-center gap-2">
                      {variant.icon}
                      <Label htmlFor={variant.id} className="text-white tracking-normal text-sm">
                        {variant.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-black border-[rgba(255,255,255,0.12)] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-white font-mono tracking-normal flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              AI-Powered Options
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-black border-t border-[rgba(255,255,255,0.12)] text-white max-h-[95vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-xl text-white font-mono tracking-normal flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              AI-Powered Options
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto max-h-[75vh]">{content}</div>
          <DrawerFooter>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white tracking-normal"
            >
              Apply Settings
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
