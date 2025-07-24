"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Suspense } from "react"
import SceneSetup from "./scene-setup"
import ModelComponent from "./model-component"
import LoadingPlaceholder from "./loading-placeholder"

export default function ModelViewer({ modelUrl }: { modelUrl: string | null }) {
  return (
    <div className="w-full h-[100dvh] bg-black bg-radial-gradient flex items-center justify-center">
      <div className="w-full h-full max-w-full max-h-full">
        <Canvas
          camera={{
            position: [0, 0, 5],
            fov: 50,
            aspect: typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1,
          }}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
          onError={(error) => {
            console.error("Canvas error:", error)
          }}
        >
          <SceneSetup />
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.6} />
          <directionalLight position={[0, 10, 5]} intensity={0.5} />

          <Suspense fallback={<LoadingPlaceholder />}>
            {modelUrl ? <ModelComponent url={modelUrl} /> : <LoadingPlaceholder />}
          </Suspense>

          <OrbitControls
            minDistance={2}
            maxDistance={12}
            enableZoom={true}
            enablePan={true}
            autoRotate={true}
            autoRotateSpeed={0.8}
            enableDamping={true}
            dampingFactor={0.05}
            target={[0, 0, 0]}
          />
          <Environment preset="night" />
        </Canvas>
      </div>
    </div>
  )
}
