"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Mesh, Group, MeshStandardMaterial } from "three"
import type { KitchenAction } from "./kitchenAction"

interface CookingObjectsProps {
  kitchenAction: KitchenAction
}

/** Glowing flame under the pan — scale pulses for fire effect */
function FireUnderPan({ active }: { active: boolean }) {
  const flameRef = useRef<Mesh>(null)
  const innerRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!flameRef.current) return
    const t = state.clock.elapsedTime
    if (!active) {
      flameRef.current.scale.setScalar(0.001)
      if (innerRef.current) innerRef.current.scale.setScalar(0.001)
      return
    }
    const pulse = 0.55 + Math.sin(t * 8) * 0.18 + Math.sin(t * 11) * 0.08
    flameRef.current.scale.setScalar(pulse)
    if (innerRef.current) innerRef.current.scale.setScalar(pulse * 0.85)
  })

  return (
    <group position={[-1, 0.02, -0.3]} visible={active}>
      <mesh ref={flameRef}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff3300"
          emissiveIntensity={2.2}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh ref={innerRef} position={[0.04, 0.06, 0.02]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ff8800"
          emissiveIntensity={1.6}
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  )
}

function PrepTable() {
  return (
    <group position={[2.4, -0.35, 0.8]}>
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[1.2, 0.08, 0.9]} />
        <meshStandardMaterial color="#6B4E3D" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, -0.15, 0]}>
        <boxGeometry args={[1.0, 0.35, 0.7]} />
        <meshStandardMaterial color="#4a3728" roughness={0.6} />
      </mesh>
    </group>
  )
}

function Counter() {
  return (
    <group position={[0, -0.5, 0]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.15, 2.5]} />
        <meshStandardMaterial color="#8B7355" roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 1, 2.5]} />
        <meshStandardMaterial color="#654321" roughness={0.5} />
      </mesh>
      {[-2, 0, 2].map((x, i) => (
        <mesh key={i} position={[x, -0.6, 1.26]} castShadow>
          <boxGeometry args={[1.8, 0.9, 0.05]} />
          <meshStandardMaterial color="#5D4037" roughness={0.4} />
        </mesh>
      ))}
      {[-2, 0, 2].map((x, i) => (
        <mesh key={i} position={[x, -0.6, 1.3]} castShadow>
          <boxGeometry args={[0.3, 0.05, 0.05]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function Stove({ burnerOn }: { burnerOn: boolean }) {
  const glowRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (glowRef.current && burnerOn) {
      const m = glowRef.current.material as MeshStandardMaterial
      m.opacity = 0.45 + Math.sin(state.clock.elapsedTime * 5) * 0.35
    }
  })

  return (
    <group position={[-1, 0, -0.3]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.12, 1.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.25} metalness={0.55} />
      </mesh>
      {[[-0.45, -0.3], [-0.45, 0.3], [0.45, -0.3], [0.45, 0.3]].map(([x, z], i) => (
        <group key={i} position={[x, 0.08, z]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 0.02, 32]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          {burnerOn && i === 0 && (
            <mesh ref={glowRef}>
              <cylinderGeometry args={[0.17, 0.17, 0.04, 32]} />
              <meshStandardMaterial
                color="#ff5500"
                emissive="#ff3300"
                emissiveIntensity={2}
                transparent
                opacity={0.75}
              />
            </mesh>
          )}
        </group>
      ))}
      <group position={[0, 0, 0.65]}>
        {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
            <meshStandardMaterial color="#333" metalness={0.35} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function FryingPan({ kitchenAction }: { kitchenAction: KitchenAction }) {
  const panGroupRef = useRef<Group>(null)

  useFrame((state) => {
    if (!panGroupRef.current) return
    const t = state.clock.elapsedTime

    if (kitchenAction === "stir") {
      panGroupRef.current.rotation.y += 0.05
    } else {
      panGroupRef.current.rotation.y *= 0.92
    }

    if (kitchenAction === "cook" || kitchenAction === "stir") {
      panGroupRef.current.position.y = 0.15 + Math.sin(t * 3) * 0.04
    } else {
      panGroupRef.current.position.y = 0.15
    }
  })

  const heated = kitchenAction === "heat" || kitchenAction === "cook" || kitchenAction === "stir"

  return (
    <group ref={panGroupRef} position={[-1, 0.15, -0.3]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.32, 0.08, 32]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.32, 0.3, 0.06, 32]} />
        <meshStandardMaterial color="#151515" metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
        <meshStandardMaterial color="#222" roughness={0.6} />
      </mesh>
      {heated && (
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.01, 32]} />
          <meshStandardMaterial
            color="#FF7A18"
            emissive="#FF7A18"
            emissiveIntensity={0.55}
            transparent
            opacity={0.35}
          />
        </mesh>
      )}
    </group>
  )
}

function CuttingBoard() {
  return (
    <group position={[1.2, 0.05, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.04, 0.4]} />
        <meshStandardMaterial color="#DEB887" roughness={0.7} />
      </mesh>
    </group>
  )
}

function Knife({ isChopping }: { isChopping: boolean }) {
  const knifeRef = useRef<Group>(null)

  useFrame((state) => {
    if (!knifeRef.current) return
    if (isChopping) {
      knifeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 8) * 0.35 - 0.25
      knifeRef.current.position.y = 0.15 + Math.abs(Math.sin(state.clock.elapsedTime * 8)) * 0.12
    } else {
      knifeRef.current.rotation.x *= 0.9
      knifeRef.current.position.y = 0.15
    }
  })

  return (
    <group ref={knifeRef} position={[1.5, 0.15, 0]} rotation={[0, Math.PI / 4, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.2, 0.005, 0.05]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.02, 0.03]} />
        <meshStandardMaterial color="#2D2D2D" roughness={0.5} />
      </mesh>
    </group>
  )
}

function IngredientSpheres({ onBoard }: { onBoard: boolean }) {
  if (!onBoard) return null
  const positions: [number, number, number][] = [
    [-0.12, 0.06, -0.06],
    [0.08, 0.05, 0.06],
    [-0.05, 0.055, 0.1],
    [0.14, 0.05, -0.1],
  ]
  const colors = ["#e63946", "#ffb703", "#2a9d8f", "#9b5de5"]
  return (
    <group position={[1.2, 0.08, 0]}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={colors[i % colors.length]} roughness={0.45} />
        </mesh>
      ))}
    </group>
  )
}

function VegetablesOnCounter({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <group position={[2, 0.1, 0.5]}>
      <mesh castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FF4B4B" roughness={0.4} />
      </mesh>
      <mesh position={[0.15, 0, 0]} castShadow>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#FFD65A" roughness={0.3} />
      </mesh>
    </group>
  )
}

function IngredientsInPan({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <group position={[-1, 0.2, -0.3]}>
      {[
        [0.05, 0, 0.05],
        [-0.08, 0, -0.03],
        [0.02, 0, -0.08],
        [-0.05, 0, 0.08],
        [0.1, 0, 0],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.04, 0.02, 0.04]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#FF4B4B" : "#FFD65A"} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function CookingObjects({ kitchenAction }: CookingObjectsProps) {
  const isChop = kitchenAction === "chop"
  const fireActive = kitchenAction === "heat" || kitchenAction === "cook" || kitchenAction === "stir"
  const burnerOn = fireActive
  const showPanFood = kitchenAction === "cook" || kitchenAction === "stir"

  return (
    <group>
      <PrepTable />
      <Counter />
      <Stove burnerOn={burnerOn} />
      <FryingPan kitchenAction={kitchenAction} />
      <FireUnderPan active={fireActive} />
      <CuttingBoard />
      <Knife isChopping={isChop} />
      <IngredientSpheres onBoard={isChop} />
      <VegetablesOnCounter show={kitchenAction === "idle"} />
      <IngredientsInPan show={showPanFood} />
    </group>
  )
}
