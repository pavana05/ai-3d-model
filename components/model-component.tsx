"use client"

import { Suspense, useEffect, useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import LoadingSpinner from "./loading-spinner"

interface ModelComponentProps {
  modelUrl?: string
  className?: string
}

function Model({ url }: { url: string }) {
  const [gltf, setGltf] = useState<THREE.Group | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    if (!url) return

    const loadModel = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Create a new GLTFLoader instance
        const loader = new GLTFLoader()

        // Load the GLTF model
        const result = await new Promise<any>((resolve, reject) => {
          loader.load(
            url,
            (gltf) => resolve(gltf),
            (progress) => {
              console.log("Loading progress:", (progress.loaded / progress.total) * 100 + "%")
            },
            (error) => reject(error),
          )
        })

        if (!mountedRef.current) return

        if (result && result.scene) {
          // Clone the scene to avoid issues with multiple instances
          const scene = result.scene.clone()

          // Calculate bounding box for proper positioning
          const box = new THREE.Box3().setFromObject(scene)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())

          // Center the model
          scene.position.sub(center)

          // Scale the model to fit in a reasonable size
          const maxDimension = Math.max(size.x, size.y, size.z)
          if (maxDimension > 0) {
            const scale = 2 / maxDimension
            scene.scale.setScalar(scale)
          }

          setGltf(scene)
        } else {
          throw new Error("Invalid GLTF structure")
        }
      } catch (err) {
        console.error("Model loading error:", err)
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : "Failed to load 3D model")
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    loadModel()

    return () => {
      mountedRef.current = false
    }
  }, [url])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    )
  }

  if (!gltf) {
    return null
  }

  return <primitive object={gltf} />
}

export default function ModelComponent({ modelUrl, className }: ModelComponentProps) {
  if (!modelUrl) {
    return (
      <div className={`flex items-center justify-center h-full ${className || ""}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📦</div>
          <p>No model to display</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full ${className || ""}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        <Suspense fallback={<LoadingSpinner />}>
          <Model url={modelUrl} />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={1} maxDistance={10} />
      </Canvas>
    </div>
  )
}
