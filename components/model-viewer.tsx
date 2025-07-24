"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import ModelComponent from "./model-component"
import LoadingPlaceholder from "./loading-placeholder"

interface ModelViewerProps {
  modelUrl?: string
  className?: string
}

export default function ModelViewer({ modelUrl, className }: ModelViewerProps) {
  return (
    <div className={`w-full h-full bg-gray-900 rounded-lg overflow-hidden ${className || ""}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />

        <Suspense fallback={<LoadingPlaceholder />}>
          {modelUrl ? <ModelComponent modelUrl={modelUrl} /> : <LoadingPlaceholder />}
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          autoRotate={!modelUrl}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}
