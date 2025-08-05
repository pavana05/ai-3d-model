"use client"

import { useEffect, useState, useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { useGLTF, Center, Html } from "@react-three/drei" // Corrected import for Html
import { Box3, Vector3, type Group, type Mesh, Object3D } from "three"
import LoadingSpinner from "./loading-spinner"

export default function ModelComponent({ url }: { url: string | null }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { camera } = useThree()
  const groupRef = useRef<Group>(null)

  // Load GLTF with error handling
  const gltf = useGLTF(url, undefined, undefined, (loadError) => {
    console.error("GLTF Loading Error (raw):", loadError) // Log the raw error for debugging
    let errorMessage = "Failed to load 3D model. Please check the URL or try again."

    // Attempt to extract a more specific message if available
    if (loadError instanceof Error) {
      errorMessage = `Failed to load 3D model: ${loadError.message}`
    } else if (
      loadError &&
      typeof loadError === "object" &&
      "message" in loadError &&
      typeof loadError.message === "string"
    ) {
      errorMessage = `Failed to load 3D model: ${loadError.message}`
    } else if (typeof loadError === "string") {
      errorMessage = `Failed to load 3D model: ${loadError}`
    } else if (loadError && typeof loadError === "object" && "type" in loadError && loadError.type === "error") {
      // This might be a ProgressEvent for network errors
      errorMessage = `Failed to load 3D model: Network or file access error. (Status: ${loadError.status || "unknown"})`
    } else {
      // Fallback for the unusual manager object error or other unknown errors
      errorMessage = `Failed to load 3D model. An unexpected error occurred during loading. Please ensure the URL is correct and the file is a valid GLB. (Details: ${JSON.stringify(loadError)})`
    }

    setError(errorMessage)
    setIsLoading(false)
  })

  useEffect(() => {
    // Defensive check for invalid URL before attempting to load
    if (!url || url.trim() === "") {
      setError("Invalid model URL provided. Please ensure a valid GLB URL is generated.")
      setIsLoading(false)
      return
    }

    // If gltf is null, and no error has been set yet (e.g., by the initial URL check),
    // it means useGLTF didn't return a model, likely due to an internal loading issue.
    if (!gltf && !error && url && url.trim() !== "") {
      setError("Model loading failed or returned an empty scene. Check console for details.")
      setIsLoading(false)
      return
    }

    if (!gltf) return // Exit if gltf is still null (e.g., if url was initially invalid)

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
        setError("Model loaded but scene is empty or invalid.")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error processing model after load:", err)
      setError(`Error processing the 3D model: ${err instanceof Error ? err.message : "Unknown error"}`)
      setIsLoading(false)
    }
  }, [gltf, camera, url, error]) // Add error to dependency array to prevent infinite loop if error is set inside

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
            {/* Display the error message using Html */}
            <Html position={[0, 0, 0.1]} center>
              <div className="w-[300px] p-2 text-center text-sm text-red-600 bg-white rounded-md shadow-lg">
                {error}
              </div>
            </Html>
          </group>
        </group>
      </Center>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!gltf?.scene) {
    // This case should ideally be caught by the error state if url is invalid
    // or by the loading spinner if it's still fetching.
    // This fallback is for unexpected scenarios where gltf is null but no error is set.
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
