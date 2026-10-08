"use client"

export function KitchenLighting() {
  return (
    <>
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.9}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-3, 4, 6]} intensity={0.35} />
      <pointLight position={[0, 3, 0]} intensity={0.25} color="#FFD65A" />
    </>
  )
}
