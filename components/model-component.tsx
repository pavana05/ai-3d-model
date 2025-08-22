"use client"

import { useEffect, useRef } from "react"
import { useThree, useFrame, useLoader } from "@react-three/fiber"
import { Center } from "@react-three/drei"
import { Box3, Vector3, type Group, type Mesh, type Object3D } from "three"
import { GLTFLoader, type GLTF } from "three-stdlib"

function ModelRenderer({ url }: { url: string }) {
  const { camera, controls } = useThree()
  const groupRef = useRef<Group>(null)

  // Load GLTF with proper cross-origin settings
  const gltf = useLoader<GLTF>(GLTFLoader, url, (loader) => {
    const l = loader as GLTFLoader
    l.setCrossOrigin?.("anonymous")
    // Some servers may not support credentials for GLB blobs; keep disabled.
    // @ts-expect-error - not all GLTFLoader versions expose setWithCredentials
    l.setWithCredentials?.(false)
  })

  useEffect(() => {
    if (!gltf?.scene) return

    try {
      // Gather some info and frame the model
      const traverseAndCount = (object: Object3D) => {
        if ((object as any).isMesh) {
          const mesh = object as Mesh
          void mesh // reserved for potential future metrics/logging
        }
        object.children.forEach(traverseAndCount)
      }
      traverseAndCount(gltf.scene)

      // Compute bounding box and position camera
      let maxDim = 2
      try {
        const box = new Box3().setFromObject(gltf.scene)
        const size = box.getSize(new Vector3())
        maxDim = Math.max(size.x, size.y, size.z) || 2
      } catch {
        // Fallback to default
        maxDim = 2
      }

      const distance = Math.max(4, maxDim * 1.5)
      camera.position.set(0, 0, distance)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()

      if (controls) {
        // Focus controls on the scene center for proper orbiting
        // @ts-expect-error - controls type is generic in r3f state
        controls.target.set(0, 0, 0)
        // @ts-expect-error
        controls.update?.()
      }
    } catch (err) {
      console.error("Error framing model:", err)
    }
  }, [gltf, camera, controls])

  // Auto-rotate for presentation
  useFrame((state) => {
    if (groupRef.current && gltf?.scene) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  if (!gltf?.scene) {
    // In Suspense fallback, this is rarely hit, but keep a neutral placeholder
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
        <primitive object={gltf.scene} scale={1} position={[0, 0, 0]} />
      </group>
    </Center>
  )
}

export default function ModelComponent({ url }: { url: string | null }) {
  // Guard: Only load when we have a valid string URL
  const shouldLoad = typeof url === "string" && url.trim().length > 0

  if (!shouldLoad) {
    // Show a simple neutral placeholder while no URL is available
    return (
      <Center>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#999999" />
        </mesh>
      </Center>
    )
  }

  // Let Suspense in the parent handle the actual loading spinner
  return <ModelRenderer key={url} url={url} />
}
