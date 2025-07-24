"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Trash2, Eye, Calendar } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SavedModel {
  id: string
  name: string
  prompt: string
  modelUrl: string
  createdAt: string
}

interface SavedModelsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoadModel: (url: string, prompt: string) => void
}

export default function SavedModelsDialog({ open, onOpenChange, onLoadModel }: SavedModelsDialogProps) {
  const [models, setModels] = useState<SavedModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { getSavedModels, deleteModel } = useAuth()

  useEffect(() => {
    if (open) {
      loadModels()
    }
  }, [open])

  const loadModels = async () => {
    setIsLoading(true)
    const savedModels = await getSavedModels()
    setModels(savedModels)
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const result = await deleteModel(id)
    if (result.success) {
      setModels(models.filter((model) => model.id !== id))
    }
    setDeletingId(null)
  }

  const handleLoad = (model: SavedModel) => {
    onLoadModel(model.modelUrl, model.prompt)
    onOpenChange(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-800/95 backdrop-blur-xl border-white/20 shadow-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            My Saved Models
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="ml-2 text-gray-400">Loading your models...</span>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No saved models yet</h3>
              <p className="text-gray-400 text-sm">Generate and save your first 3D model to see it here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {models.map((model) => (
                <Card
                  key={model.id}
                  className="bg-slate-800/40 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2 truncate">{model.name}</h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{model.prompt}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(model.createdAt)}</span>
                          <Badge variant="outline" className="bg-blue-900/50 text-blue-300 border-blue-500/30">
                            GLB
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleLoad(model)}
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Load
                        </Button>
                        <Button
                          onClick={() => handleDelete(model.id)}
                          disabled={deletingId === model.id}
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                        >
                          {deletingId === model.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
