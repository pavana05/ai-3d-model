"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Cpu, Sparkles, Eye, Palette, Grid3X3, Download, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import EnhancedProgressBar from "./enhanced-progress-bar"

interface LoadingStage {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  weight: number // Weight for progress calculation
}

interface AdvancedLoadingScreenProps {
  isLoading: boolean
  jobStatuses: Array<{ uuid: string; status: string }>
  currentStage?: string
}

export default function AdvancedLoadingScreen({ isLoading, jobStatuses, currentStage }: AdvancedLoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  const stages: LoadingStage[] = [
    {
      id: "initialization",
      name: "Initializing",
      description: "Preparing AI models and processing pipeline",
      icon: <Cpu className="h-5 w-5" />,
      color: "from-blue-500 to-cyan-500",
      weight: 10,
    },
    {
      id: "analysis",
      name: "Image Analysis",
      description: "Analyzing input images and extracting features",
      icon: <Eye className="h-5 w-5" />,
      color: "from-purple-500 to-pink-500",
      weight: 15,
    },
    {
      id: "generation",
      name: "3D Generation",
      description: "Creating 3D geometry from analyzed data",
      icon: <Grid3X3 className="h-5 w-5" />,
      color: "from-green-500 to-emerald-500",
      weight: 40,
    },
    {
      id: "enhancement",
      name: "Detail Enhancement",
      description: "Applying AI-powered detail boost and refinements",
      icon: <Sparkles className="h-5 w-5" />,
      color: "from-yellow-500 to-orange-500",
      weight: 20,
    },
    {
      id: "texturing",
      name: "Texture Generation",
      description: "Creating high-quality textures and materials",
      icon: <Palette className="h-5 w-5" />,
      color: "from-red-500 to-rose-500",
      weight: 10,
    },
    {
      id: "finalization",
      name: "Finalizing",
      description: "Packaging and preparing download",
      icon: <Download className="h-5 w-5" />,
      color: "from-teal-500 to-cyan-500",
      weight: 5,
    },
  ]

  // Generate floating particles
  useEffect(() => {
    if (isLoading) {
      const newParticles = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
      }))
      setParticles(newParticles)
    }
  }, [isLoading])

  // Calculate progress based on job statuses
  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      setCurrentStageIndex(0)
      return
    }

    if (jobStatuses.length === 0) {
      // Initial loading - show first stage
      setProgress(5)
      setCurrentStageIndex(0)
      return
    }

    // Calculate progress based on job completion
    const totalJobs = jobStatuses.length
    const completedJobs = jobStatuses.filter((job) => job.status === "Done").length
    const processingJobs = jobStatuses.filter((job) => job.status === "Processing").length
    const failedJobs = jobStatuses.filter((job) => job.status === "Failed").length

    // Base progress from completed jobs
    let calculatedProgress = (completedJobs / totalJobs) * 85 // Reserve 15% for final processing

    // Add partial progress for processing jobs
    if (processingJobs > 0) {
      calculatedProgress += (processingJobs / totalJobs) * 15 // Add partial progress for processing
    }

    // Handle failed jobs
    if (failedJobs > 0) {
      calculatedProgress = Math.max(calculatedProgress, 10) // Ensure some progress even with failures
    }

    // If all jobs are done, complete the progress
    if (completedJobs === totalJobs && totalJobs > 0) {
      calculatedProgress = 100
    }

    // Determine current stage based on progress
    let cumulativeWeight = 0
    let stageIndex = 0

    for (let i = 0; i < stages.length; i++) {
      cumulativeWeight += stages[i].weight
      if (calculatedProgress <= cumulativeWeight) {
        stageIndex = i
        break
      }
    }

    // If progress is complete, show final stage
    if (calculatedProgress >= 95) {
      stageIndex = stages.length - 1
    }

    setProgress(calculatedProgress)
    setCurrentStageIndex(stageIndex)
  }, [isLoading, jobStatuses, stages])

  if (!isLoading) {
    return null
  }

  const currentStageData = stages[currentStageIndex] || stages[0]
  const hasJobs = jobStatuses.length > 0

  return (
    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center overflow-y-auto">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-500/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse delay-500" />

        {/* Floating particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px] opacity-50" />
      </div>

      {/* Main loading content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        <Card className="bg-black/70 border-white/20 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-8">
            {/* Header with current stage */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className={`p-6 rounded-full bg-gradient-to-r ${currentStageData.color} animate-pulse shadow-lg`}>
                  {currentStageData.icon}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">{currentStageData.name}</h2>
              <p className="text-gray-300 text-lg">{currentStageData.description}</p>
            </div>

            {/* Main progress bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg text-gray-300">Overall Progress</span>
                <span className="text-xl text-white font-mono font-bold">{Math.round(progress)}%</span>
              </div>
              <EnhancedProgressBar
                value={progress}
                size="lg"
                animated={true}
                showPercentage={false}
                variant={progress >= 100 ? "success" : "default"}
              />
            </div>

            {/* Stage indicators */}
            <div className="grid grid-cols-6 gap-3 mb-8">
              {stages.map((stage, index) => {
                const isCompleted = index < currentStageIndex
                const isCurrent = index === currentStageIndex
                const stageProgress = isCompleted ? 100 : isCurrent ? Math.min((progress / 100) * 100, 100) : 0

                return (
                  <div key={stage.id} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                        isCompleted
                          ? `bg-gradient-to-r ${stage.color} text-white shadow-lg scale-110`
                          : isCurrent
                            ? `bg-gradient-to-r ${stage.color} text-white shadow-lg animate-pulse`
                            : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isCurrent ? (
                        <div className="w-3 h-3 bg-current rounded-full animate-ping" />
                      ) : (
                        <div className="w-2 h-2 bg-current rounded-full" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-2 text-center leading-tight font-medium">
                      {stage.name}
                    </span>
                    {/* Mini progress bar for current stage */}
                    {isCurrent && (
                      <div className="w-full mt-1">
                        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-300`}
                            style={{ width: `${stageProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Job status details */}
            {hasJobs && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-gray-300">Processing Tasks</span>
                  <Badge variant="outline" className="text-sm bg-blue-900/50 text-blue-300 border-blue-500/30">
                    {jobStatuses.filter((job) => job.status === "Done").length}/{jobStatuses.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {jobStatuses.map((job, index) => (
                    <div
                      key={job.uuid}
                      className={`p-3 rounded-lg border text-sm transition-all duration-300 ${
                        job.status === "Done"
                          ? "bg-green-900/30 border-green-500/40 text-green-300 shadow-lg"
                          : job.status === "Processing"
                            ? "bg-blue-900/30 border-blue-500/40 text-blue-300 animate-pulse"
                            : job.status === "Failed"
                              ? "bg-red-900/30 border-red-500/40 text-red-300"
                              : "bg-gray-900/30 border-gray-500/40 text-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Task {index + 1}</span>
                        <div className="flex items-center gap-1">
                          {job.status === "Processing" && <Clock className="h-3 w-3 animate-spin" />}
                          <div
                            className={`w-3 h-3 rounded-full ${
                              job.status === "Done"
                                ? "bg-green-400 shadow-lg shadow-green-400/50"
                                : job.status === "Processing"
                                  ? "bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50"
                                  : job.status === "Failed"
                                    ? "bg-red-400"
                                    : "bg-gray-400"
                            }`}
                          />
                        </div>
                      </div>
                      <div className="text-xs opacity-80 capitalize mt-1">{job.status.toLowerCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status message */}
            <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="text-lg text-white font-semibold mb-2">
                    {progress < 20
                      ? "Initializing AI Processing..."
                      : progress < 40
                        ? "Analyzing Your Input..."
                        : progress < 70
                          ? "Generating 3D Model..."
                          : progress < 90
                            ? "Enhancing Details..."
                            : progress < 100
                              ? "Finalizing Model..."
                              : "Processing Complete!"}
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {hasJobs
                      ? `Processing ${jobStatuses.length} task${jobStatuses.length > 1 ? "s" : ""} with advanced AI algorithms. Each task involves complex neural network calculations for optimal 3D model generation.`
                      : "Our advanced AI is preparing to process your request. This involves loading specialized models and optimizing processing parameters for your specific input."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
