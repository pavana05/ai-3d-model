"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Heart, Trash2, Eye, Search, Grid3X3, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface SavedModel {
  id: string
  name: string
  prompt: string
  modelUrl: string
  createdAt: string
  quality: string
  format: string
  description: string
}

export default function LibraryPage() {
  const [models, setModels] = useState<SavedModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent")
  const [likedModels, setLikedModels] = useState<Set<string>>(new Set())

  const { user, getSavedModels, deleteModel } = useAuth()

  useEffect(() => {
    if (!user) return
    loadModels()
  }, [user])

  const loadModels = async () => {
    setIsLoading(true)
    try {
      const savedModels = await getSavedModels()
      setModels(savedModels)
    } catch (error) {
      console.error("Failed to load models:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredModels = models
    .filter(
      (model) =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.prompt.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return a.name.localeCompare(b.name)
    })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this model?")) return

    try {
      const result = await deleteModel(id)
      if (result.success) {
        setModels(models.filter((model) => model.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete model:", error)
    }
  }

  const toggleLike = (modelId: string) => {
    const newLiked = new Set(likedModels)
    if (newLiked.has(modelId)) {
      newLiked.delete(modelId)
    } else {
      newLiked.add(modelId)
    }
    setLikedModels(newLiked)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="bg-slate-800/60 border-white/20 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-gray-400 mb-6">Please sign in to view your saved models.</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Go to Generator
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/30 backdrop-blur-2xl border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Grid3X3 className="h-8 w-8 text-blue-400" />
                My Model Library
              </h1>
              <p className="text-gray-400 mt-1">Browse and manage your saved 3D models</p>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search models by name or prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "name")}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="recent">Recent</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mr-3" />
            <span className="text-gray-400">Loading your models...</span>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Grid3X3 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No models found</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {models.length === 0
                ? "Start by generating your first 3D model!"
                : "No models match your search. Try adjusting your filters."}
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Create New Model
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <Card
                key={model.id}
                className="bg-slate-800/40 border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden group"
              >
                {/* Model thumbnail placeholder */}
                <div className="h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Grid3X3 className="h-12 w-12 text-gray-400 opacity-50 group-hover:opacity-75 transition-opacity" />
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Model info */}
                    <div>
                      <h3 className="font-semibold text-white text-lg truncate">{model.name}</h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{model.prompt}</p>
                    </div>

                    {/* Metadata */}
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-blue-900/50 text-blue-300 border-blue-500/30">
                        {model.quality.toUpperCase()}
                      </Badge>
                      <Badge className="bg-purple-900/50 text-purple-300 border-purple-500/30">
                        {model.format.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-gray-500">{formatDate(model.createdAt)}</p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => toggleLike(model.id)}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-600 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                      >
                        <Heart className={`h-4 w-4 mr-1 ${likedModels.has(model.id) ? "fill-current" : ""}`} />
                        Like
                      </Button>
                      <Button
                        onClick={() => handleDelete(model.id)}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-600 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
