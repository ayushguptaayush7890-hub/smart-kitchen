"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { Suspense } from "react"
import { KitchenLighting } from "./KitchenLighting"
import { CookingObjects } from "./CookingObjects"
import { RobotChefModel } from "./RobotChefModel"
import type { KitchenAction } from "./kitchenAction"

interface KitchenSceneProps {
  kitchenAction: KitchenAction
  isTalking: boolean
  robotMessage: string
}

function KitchenLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#FF7A18" />
    </mesh>
  )
}

export function KitchenScene({ kitchenAction, isTalking, robotMessage }: KitchenSceneProps) {
  return (
    <div className="w-full h-full min-h-[320px]">
      <Canvas shadows gl={{ antialias: true }}>
        <Suspense fallback={<KitchenLoader />}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} intensity={0.85} castShadow />

          <KitchenLighting />

          <PerspectiveCamera makeDefault position={[0.8, 2.2, 5.2]} fov={52} />
          <OrbitControls
            enableZoom
            enablePan={false}
            minDistance={3.5}
            maxDistance={11}
            minPolarAngle={Math.PI / 7}
            maxPolarAngle={Math.PI / 2.05}
          />

          <Environment preset="apartment" />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
            <planeGeometry args={[24, 24]} />
            <meshStandardMaterial color="#f5ebe0" />
          </mesh>

          <mesh position={[0, 2.2, -4.2]} receiveShadow>
            <planeGeometry args={[22, 9]} />
            <meshStandardMaterial color="#fde8d4" />
          </mesh>

          <CookingObjects kitchenAction={kitchenAction} />
          <RobotChefModel kitchenAction={kitchenAction} isTalking={isTalking} message={robotMessage} />
        </Suspense>
      </Canvas>
    </div>
  )
}
