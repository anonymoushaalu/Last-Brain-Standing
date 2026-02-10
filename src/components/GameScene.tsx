import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import { Rook } from './Rook'
import type { GameEngine } from '../engine/GameEngine'

interface GameSceneProps {
  engine: GameEngine
}

export default function GameScene({ engine }: GameSceneProps) {
  const lightRef = useRef(null)
  const [damageState, setDamageState] = useState<'intact' | 'cracked' | 'heavily_damaged'>('intact')
  const [currentHealth, setCurrentHealth] = useState(100)
  
  // Debug mount
  useEffect(() => {
    console.log('[GameScene] mounted — engine tick:', engine.getTick())
  }, [engine])

  useFrame(() => {
    engine.tick()
  })

  // Cycle through damage states for demo
  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime
    if (elapsed > 10 && currentHealth > 50) {
      setCurrentHealth(50)
      setDamageState('cracked')
    }
    if (elapsed > 20 && currentHealth > 20) {
      setCurrentHealth(20)
      setDamageState('heavily_damaged')
    }
    if (elapsed > 30 && currentHealth > 0) {
      setCurrentHealth(0)
    }
  })

  return (
    <>
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

      {/* Hero Rook with Brain */}
      <Rook
        position={[0, 0, 0]}
        maxHealth={100}
        currentHealth={currentHealth}
        damageState={damageState}
      />
    </>
  )
}
