"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

export default function LoadingPlaceholder() {
  const cubeRef = useRef<THREE.Mesh>(null)
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += delta * 0.5
      cubeRef.current.rotation.y += delta * 0.3
    }
    if (sphereRef.current) {
      sphereRef.current.rotation.x += delta * 0.2
      sphereRef.current.rotation.z += delta * 0.4
    }
  })

  return (
    <group>
      <mesh ref={cubeRef} position={[-1, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshBasicMaterial color="white" wireframe transparent opacity={0.6} />
      </mesh>
      <mesh ref={sphereRef} position={[1, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="white" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  )
}
