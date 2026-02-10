import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { GameEngine } from '../engine/GameEngine'

interface ScreenShakeProps {
  engine: GameEngine
}

export const ScreenShake: React.FC<ScreenShakeProps> = ({ engine }) => {
  const { camera } = useThree()
  const basePositionRef = useRef({ x: 35.36, y: 35.36, z: 35.36 })

  useFrame(() => {
    const lastDamageTime = engine.getLastDamageTime()
    const now = performance.now()
    const timeSinceLastDamage = (now - lastDamageTime) / 1000

    // Screen shake effect for 0.3 seconds after damage
    if (timeSinceLastDamage < 0.3) {
      const intensity = 1 - timeSinceLastDamage / 0.3 // Fade out
      const shakeX = (Math.random() - 0.5) * intensity * 0.8
      const shakeY = (Math.random() - 0.5) * intensity * 0.8
      const shakeZ = (Math.random() - 0.5) * intensity * 0.8

      camera.position.x = basePositionRef.current.x + shakeX
      camera.position.y = basePositionRef.current.y + shakeY
      camera.position.z = basePositionRef.current.z + shakeZ
    } else {
      // Return to base position
      camera.position.x = basePositionRef.current.x
      camera.position.y = basePositionRef.current.y
      camera.position.z = basePositionRef.current.z
    }

    camera.lookAt(0, 0, 0)
  })

  return null
}
