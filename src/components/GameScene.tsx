import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import { Rook } from './Rook'
import { ZombieRenderer } from './ZombieRenderer'
import { ArcherVisuals } from './ArcherVisuals'
import { ArrowRenderer } from './ArrowRenderer'
import { DamageNumbers } from './DamageNumbers'
import { ScreenShake } from './ScreenShake'
import type { GameEngine } from '../engine/GameEngine'

interface GameSceneProps {
  engine: GameEngine
  zombieSkin?: string
  rookSkin?: string
  builderSkin?: string
}

export default function GameScene({ engine, zombieSkin = 'default', rookSkin = 'default', builderSkin = 'default' }: GameSceneProps) {
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
      {/* Lighting - Enhanced contrast */}
      <ambientLight intensity={0.35} color="#ffffff" />
      <directionalLight
        ref={lightRef}
        position={[40, 50, 40]}
        intensity={1.5}
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

      {/* Rim light for depth */}
      <directionalLight
        position={[-30, 30, -40]}
        intensity={0.4}
        color="#4CAF50"
        castShadow={false}
      />

      {/* Ground Plane - Darker for better contrast */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a3d26" metalness={0.05} roughness={0.9} />
      </mesh>

      {/* Grid for visual reference */}
      <gridHelper args={[100, 20, '#2a5d3f', '#1a3d26']} position={[0, 0, 0]} />

      {/* Hero Rook with Brain */}
      <Rook
        position={[0, 0, 0]}
        maxHealth={100}
        currentHealth={currentHealth}
        damageState={damageState}
        skin={rookSkin}
      />

      {/* Zombie Renderer - InstancedMesh for all zombies */}
      <ZombieRenderer zombies={engine.entities.filter((e) => e.type === 'zombie')} skinVariant={zombieSkin} />

      {/* Archer Units */}
      <ArcherVisuals archers={engine.getArchers()} />

      {/* Arrow Projectiles */}
      <ArrowRenderer arrows={engine.getArrows()} />

      {/* Damage Numbers (floating text) */}
      <DamageNumbers damageEvents={engine.getDamageEvents()} />

      {/* Screen Shake Effect */}
      <ScreenShake engine={engine} />
    </>
  )
}
