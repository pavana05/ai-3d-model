"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

export default function LoadingSpinner() {
  const torusRef1 = useRef<THREE.Mesh>(null)
  const torusRef2 = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (torusRef1.current) {
      torusRef1.current.rotation.x += delta * 0.5
      torusRef1.current.rotation.y += delta * 0.3
    }
    if (torusRef2.current) {
      torusRef2.current.rotation.x -= delta * 0.3
      torusRef2.current.rotation.y -= delta * 0.5
    }
  })

  return (
    <group>
      <mesh ref={torusRef1}>
        <torusGeometry args={[1, 0.1, 16, 100]} />
        <meshBasicMaterial color="white" wireframe />
      </mesh>
      <mesh ref={torusRef2} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.1, 16, 100]} />
        <meshBasicMaterial color="white" wireframe />
      </mesh>
    </group>
  )
}
