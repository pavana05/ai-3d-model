"use client"

import { useEffect, useState, useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { useGLTF, Center } from "@react-three/drei"
import { Box3, Vector3, type Group, type Mesh, Object3D } from "three"
import LoadingSpinner from "./loading-spinner"

export default function ModelComponent({ url }: { url: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { camera } = useThree()
  const groupRef = useRef<Group>(null)

  // Load GLTF with error handling
  const gltf = useGLTF(url, undefined, undefined, (loadError) => {
    console.error("GLTF Loading Error:", loadError)
    setError("Failed to load 3D model")
    setIsLoading(false)
  })

  const shouldLoad = url && url.trim() !== "" && (url.startsWith("http") || url.startsWith("/"))

  useEffect(() => {
    if (!shouldLoad) {
      setError("Invalid model URL")
      setIsLoading(false)
      return
    }

    // Reset states when URL changes
    setIsLoading(true)
    setError(null)
  }, [url, shouldLoad])

  useEffect(() => {
    if (!gltf) return

    try {
      if (gltf.scene) {
        console.log("GLTF loaded successfully")

        // More comprehensive geometry check
        let meshCount = 0
        let geometryCount = 0
        let totalVertices = 0

        const traverseAndCount = (object: Object3D) => {
          if (object instanceof Object3D) {
            // Check if it's a mesh
            if ((object as any).isMesh) {
              meshCount++
              const mesh = object as Mesh
              if (mesh.geometry) {
                geometryCount++
                const positionAttribute = mesh.geometry.attributes.position
                if (positionAttribute) {
                  totalVertices += positionAttribute.count
                }
              }
            }

            // Recursively check children
            object.children.forEach(traverseAndCount)
          }
        }

        traverseAndCount(gltf.scene)

        // Calculate bounding box with fallback
        let box: Box3
        let center: Vector3
        let size: Vector3
        let maxDim: number

        try {
          box = new Box3().setFromObject(gltf.scene)
          center = box.getCenter(new Vector3())
          size = box.getSize(new Vector3())
          maxDim = Math.max(size.x, size.y, size.z)

          // If bounding box is invalid, use default values
          if (!isFinite(maxDim) || maxDim === 0) {
            console.warn("Invalid bounding box, using default scale")
            maxDim = 2
          }
        } catch (boxError) {
          console.warn("Failed to calculate bounding box, using defaults:", boxError)
          maxDim = 2
        }

        // Reset camera position for optimal viewing
        const distance = maxDim > 0 ? Math.max(4, maxDim * 1.5) : 5
        camera.position.set(0, 0, distance)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()

        setError(null)
        setIsLoading(false)
      } else {
        console.error("GLTF scene is null or undefined")
        setError("Model loaded but scene is empty")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error processing model:", err)
      setError(`Error processing the 3D model: ${err instanceof Error ? err.message : "Unknown error"}`)
      setIsLoading(false)
    }
  }, [gltf, camera, url])

  // Auto-rotate the model for better presentation
  useFrame((state) => {
    if (groupRef.current && !isLoading && !error && gltf?.scene) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  if (error) {
    return (
      <Center>
        <group>
          {/* Error indicator cube */}
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#ff6b6b" />
          </mesh>
          {/* Error text plane */}
          <group position={[0, -2.5, 0]}>
            <mesh>
              <planeGeometry args={[6, 1.5]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
            </mesh>
          </group>
        </group>
      </Center>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!gltf?.scene) {
    return (
      <Center>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      </Center>
    )
  }

  return (
    <Center position={[0, 0, 0]}>
      <group ref={groupRef}>
        <primitive object={gltf.scene} scale={1.5} position={[0, 0, 0]} />
      </group>
    </Center>
  )
}
