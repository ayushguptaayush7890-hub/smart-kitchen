"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { Group, Mesh } from "three"
import type { KitchenAction } from "./kitchenAction"

interface RobotChefModelProps {
  kitchenAction: KitchenAction
  isTalking: boolean
  message: string
}

type AnimationState = "idle" | "talking" | "pointing" | "stirring" | "chopping" | "heating"

function actionToAnim(action: KitchenAction, talking: boolean): AnimationState {
  if (talking) return "talking"
  switch (action) {
    case "chop":
      return "chopping"
    case "stir":
      return "stirring"
    case "heat":
      return "heating"
    case "cook":
      return "stirring"
    default:
      return "pointing"
  }
}

/** Robot near stove — arms sync to kitchenAction */
export function RobotChefModel({ kitchenAction, isTalking, message }: RobotChefModelProps) {
  const robotRef = useRef<Group>(null)
  const headRef = useRef<Mesh>(null)
  const leftArmRef = useRef<Group>(null)
  const rightArmRef = useRef<Group>(null)
  const mouthRef = useRef<Mesh>(null)
  const [animState, setAnimState] = useState<AnimationState>("idle")

  useEffect(() => {
    setAnimState(actionToAnim(kitchenAction, isTalking))
  }, [kitchenAction, isTalking])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (mouthRef.current) {
      const open = isTalking ? 1 + Math.sin(time * 14) * 0.35 : 1
      mouthRef.current.scale.set(1, open, 1)
    }

    if (robotRef.current) {
      robotRef.current.position.y = -0.3 + Math.sin(time * 2) * 0.03
    }

    if (headRef.current) {
      if (animState === "talking") {
        headRef.current.rotation.x = Math.sin(time * 8) * 0.1
        headRef.current.rotation.z = Math.sin(time * 6) * 0.05
      } else if (animState === "heating") {
        headRef.current.rotation.y = Math.sin(time * 0.8) * 0.15 - 0.35
        headRef.current.rotation.x = Math.sin(time * 0.5) * 0.04
      } else {
        headRef.current.rotation.x = Math.sin(time * 0.5) * 0.05
        headRef.current.rotation.y = Math.sin(time * 0.3) * 0.1
      }
    }

    if (leftArmRef.current && rightArmRef.current) {
      switch (animState) {
        case "pointing":
          leftArmRef.current.rotation.x = -0.8
          leftArmRef.current.rotation.z = -0.3
          rightArmRef.current.rotation.x = Math.sin(time * 2) * 0.1
          break
        case "stirring":
          leftArmRef.current.rotation.x = -0.55
          leftArmRef.current.rotation.z = Math.sin(time * 5) * 0.45
          rightArmRef.current.rotation.x = -0.45
          rightArmRef.current.rotation.z = Math.sin(time * 5 + Math.PI * 0.7) * 0.35
          break
        case "chopping":
          rightArmRef.current.rotation.x = -0.45 + Math.sin(time * 9) * 0.55
          rightArmRef.current.rotation.z = -0.2
          leftArmRef.current.rotation.x = -0.35
          leftArmRef.current.rotation.z = 0.15
          break
        case "heating":
          leftArmRef.current.rotation.x = -0.4
          leftArmRef.current.rotation.z = 0.5
          rightArmRef.current.rotation.x = -0.65
          rightArmRef.current.rotation.z = -0.35
          break
        case "talking":
          leftArmRef.current.rotation.z = Math.sin(time * 3) * 0.2
          rightArmRef.current.rotation.z = Math.sin(time * 3 + 1) * 0.2
          break
        default:
          leftArmRef.current.rotation.x = Math.sin(time) * 0.1
          rightArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.1
      }
    }
  })

  return (
    <group ref={robotRef} position={[1.35, -0.3, 0.85]} scale={0.9} rotation={[0, -0.55, 0]}>
      <Html position={[0, 1.85, 0]} center style={{ pointerEvents: "none" }}>
        <div
          className="rounded-[15px] shadow-md"
          style={{
            background: "#FFE7A0",
            padding: "12px",
            maxWidth: "280px",
            maxHeight: "120px",
            fontSize: "13px",
            color: "#1F2937",
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1.4,
            overflow: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ margin: 0, wordWrap: "break-word" }}>{message}</p>
        </div>
      </Html>

      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.6, 16]} />
        <meshStandardMaterial color="#E8E8E8" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.5, 0.26]}>
        <boxGeometry args={[0.2, 0.4, 0.02]} />
        <meshStandardMaterial color="#FF7A18" />
      </mesh>
      <mesh position={[0, 0.6, 0.28]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color="#34D399"
          emissive="#34D399"
          emissiveIntensity={isTalking ? 2 : 0.5}
        />
      </mesh>

      <group ref={headRef}>
        <mesh position={[0, 1, 0]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#E8E8E8" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1, 0.15]}>
          <boxGeometry args={[0.28, 0.2, 0.1]} />
          <meshStandardMaterial color="#2D2D2D" roughness={0.2} />
        </mesh>
        <mesh position={[-0.08, 1.02, 0.21]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={1} />
        </mesh>
        <mesh position={[0.08, 1.02, 0.21]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={1} />
        </mesh>
        <mesh ref={mouthRef} position={[0, 0.92, 0.21]}>
          <boxGeometry args={[0.12, 0.03, 0.02]} />
          <meshStandardMaterial
            color="#FF7A18"
            emissive="#FF7A18"
            emissiveIntensity={isTalking ? 1 : 0.3}
          />
        </mesh>
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
          <meshStandardMaterial color="#666" metalness={0.5} />
        </mesh>
        <mesh position={[0, 1.32, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#FF4B4B" emissive="#FF4B4B" emissiveIntensity={0.5} />
        </mesh>
      </group>

      <group position={[0, 1.25, 0]}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.22, 0.08, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </mesh>
      </group>

      <group ref={leftArmRef} position={[-0.35, 0.6, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.25, 8]} />
          <meshStandardMaterial color="#CCCCCC" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#888" metalness={0.5} />
        </mesh>
        <mesh position={[0, -0.42, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
          <meshStandardMaterial color="#CCCCCC" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#FF7A18" metalness={0.3} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.35, 0.6, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.25, 8]} />
          <meshStandardMaterial color="#CCCCCC" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#888" metalness={0.5} />
        </mesh>
        <mesh position={[0, -0.42, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
          <meshStandardMaterial color="#CCCCCC" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#FF7A18" metalness={0.3} />
        </mesh>
      </group>

      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#444" metalness={0.5} roughness={0.3} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.22, 0.05, Math.sin(angle) * 0.22]}
          rotation={[Math.PI / 2, 0, angle]}
        >
          <cylinderGeometry args={[0.04, 0.04, 0.03, 8]} />
          <meshStandardMaterial color="#222" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
