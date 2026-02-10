import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { GameEngine } from '../engine/GameEngine'

interface GameSceneProps {
  engine: GameEngine
}

export default function GameScene({ engine }: GameSceneProps) {
  const lightRef = useRef(null)

  useFrame(() => {
    engine.tick()
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        ref={lightRef}
        position={[50, 50, 50]}
        intensity={1}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        castShadow
      />

      {/* Game world - TODO: Add game entities */}
      <gridHelper args={[100, 10]} />
    </>
  )
}
