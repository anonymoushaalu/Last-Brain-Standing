import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export interface RookProps {
  position?: [number, number, number]
  maxHealth?: number
  currentHealth?: number
  damageState?: 'intact' | 'cracked' | 'heavily_damaged'
}

/**
  * Low-poly chess rook with animated brain on top.
  * Shows 3 damage states through material and visual degradation.
  */
export function Rook({
  position = [0, 0, 0],
  maxHealth = 100,
  currentHealth = 100,
  damageState = 'intact'
}: RookProps) {
  const groupRef = useRef<THREE.Group>(null)
  const brainRef = useRef<THREE.Mesh>(null)
  const crackRef = useRef<THREE.Mesh>(null)

  // Debug mount
  useEffect(() => {
    console.log(`[Rook] mounted — damageState=${damageState} currentHealth=${currentHealth}/${maxHealth}`)
  }, [])

  // Get base color based on damage
  const getBaseColor = () => {
    switch (damageState) {
      case 'intact':
        return '#6b4423'
      case 'cracked':
        return '#4a2f1a'
      case 'heavily_damaged':
        return '#2a1a0a'
    }
  }

  // Get roughness based on damage
  const getRoughness = () => {
    switch (damageState) {
      case 'intact':
        return 0.7
      case 'cracked':
        return 0.8
      case 'heavily_damaged':
        return 0.9
    }
  }

  // Pulsing animation
  useFrame(({ clock }) => {
    if (brainRef.current) {
      // Pulse scale
      const pulse = 0.95 + 0.05 * Math.sin(clock.elapsedTime * 3)
      brainRef.current.scale.set(pulse, pulse, pulse)

      // Pulse emissive intensity
      if (brainRef.current.material instanceof THREE.MeshStandardMaterial) {
        const emissiveIntensity = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 2.5)
        brainRef.current.material.emissiveIntensity = emissiveIntensity
      }
    }

    // Spin the crack effect (damage visualization)
    if (crackRef.current && damageState !== 'intact') {
      crackRef.current.rotation.z += 0.02
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Rook Base - Low-poly castle tower */}

      {/* Main tower body */}
      <mesh castShadow receiveShadow position={[0, 3, 0]}>
        <boxGeometry args={[4, 6, 4]} />
        <meshStandardMaterial color={getBaseColor()} roughness={getRoughness()} metalness={0.1} />
      </mesh>

      {/* Rook base platform */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[6, 1, 6]} />
        <meshStandardMaterial color={getBaseColor()} roughness={getRoughness()} metalness={0.1} />
      </mesh>

      {/* Crenellations (left-right) */}
      <mesh castShadow receiveShadow position={[-3, 6.5, 0]}>
        <boxGeometry args={[1.5, 1.5, 4]} />
        <meshStandardMaterial color={getBaseColor()} roughness={getRoughness()} metalness={0.1} />
      </mesh>
      <mesh castShadow receiveShadow position={[3, 6.5, 0]}>
        <boxGeometry args={[1.5, 1.5, 4]} />
        <meshStandardMaterial color={getBaseColor()} roughness={getRoughness()} metalness={0.1} />
      </mesh>

      {/* Crenellations (front-back) */}
      <mesh castShadow receiveShadow position={[0, 6.5, -3]}>
        <boxGeometry args={[4, 1.5, 1.5]} />
        <meshStandardMaterial color={getBaseColor()} roughness={getRoughness()} metalness={0.1} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 6.5, 3]}>
        <boxGeometry args={[4, 1.5, 1.5]} />
        <meshStandardMaterial color={getBaseColor()} roughness={getRoughness()} metalness={0.1} />
      </mesh>

      {/* Brain on top - Hot pink emissive */}
      <mesh
        ref={brainRef}
        castShadow
        position={[0, 8.5, 0]}
        scale={1}
      >
        {/* Irregular brain-like shape using icosahedron */}
        <icosahedronGeometry args={[1.8, 3]} />
        <meshStandardMaterial
          color="#ff1493"
          emissive="#ff1493"
          emissiveIntensity={0.8}
          roughness={0.3}
          metalness={0.4}
          toneMapped={true}
        />
      </mesh>

      {/* Damage crack visualization */}
      {damageState !== 'intact' && (
        <mesh
          ref={crackRef}
          position={[0, 4, 0]}
          scale={0.8}
          rotation={[0, 0, 0]}
        >
          <icosahedronGeometry args={[2.5, 2]} />
          <meshStandardMaterial
            color="#8b0000"
            emissive="#ff6666"
            emissiveIntensity={damageState === 'heavily_damaged' ? 0.6 : 0.3}
            opacity={0.3}
            transparent
            wireframe={damageState === 'heavily_damaged'}
          />
        </mesh>
      )}

      {/* Health indicator - background bar */}
      <mesh position={[0, 10, 0]}>
        <boxGeometry args={[4, 0.3, 0.2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Health fill - scales with health */}
      <mesh position={[1 - 2 * (1 - currentHealth / maxHealth), 10, 0.15]}>
        <boxGeometry args={[4 * (currentHealth / maxHealth), 0.3, 0.1]} />
        <meshStandardMaterial
          color={
            currentHealth / maxHealth > 0.5
              ? '#00ff00'
              : currentHealth / maxHealth > 0.25
                ? '#ffff00'
                : '#ff0000'
          }
        />
      </mesh>
    </group>
  )
}
