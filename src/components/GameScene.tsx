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
      {/* Locked isometric camera handled by parent Canvas */}
      
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#ffffff" />
      <directionalLight
        ref={lightRef}
        position={[40, 40, 40]}
        intensity={1.2}
        color="#ffffff"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        castShadow
      />

      {/* Ground Plane */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2a5d3a" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Grid for visual reference */}
      <gridHelper args={[100, 20, '#444444', '#222222']} position={[0, 0, 0]} />

      {/* Center marker - small cube to verify center */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
    </>
  )
}
