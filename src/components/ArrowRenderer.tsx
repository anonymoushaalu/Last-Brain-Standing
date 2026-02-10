import React from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Arrow } from '../engine/GameEngine'

interface ArrowRendererProps {
  arrows: Arrow[]
}

export const ArrowRenderer: React.FC<ArrowRendererProps> = ({ arrows }) => {
  const { scene } = useThree()

  useFrame(() => {
    // For each arrow, draw a line from origin to current position
    if (arrows.length === 0) return

    // Clear previous arrows
    scene.children.forEach((child) => {
      if (child instanceof THREE.Line && (child as any).userData.isArrow) {
        scene.remove(child)
      }
    })

    // Draw new lines for each arrow
    arrows.forEach((arrow) => {
      const material = new THREE.LineBasicMaterial({
        color: 0xFF6B00, // Orange arrows
        linewidth: 2,
      })

      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array([
        arrow.origin.x,
        arrow.origin.y + 0.5,
        arrow.origin.z,
        arrow.origin.x + (arrow.target.x - arrow.origin.x) * arrow.progress,
        arrow.origin.y + 0.5 + (arrow.target.y - arrow.origin.y) * arrow.progress,
        arrow.origin.z + (arrow.target.z - arrow.origin.z) * arrow.progress,
      ])

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const line = new THREE.Line(geometry, material)
      line.userData.isArrow = true
      scene.add(line)
    })
  })

  return null
}
