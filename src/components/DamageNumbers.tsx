import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { DamageEvent } from '../engine/GameEngine'

interface DamageNumbersProps {
  damageEvents: DamageEvent[]
}

export const DamageNumbers: React.FC<DamageNumbersProps> = ({ damageEvents }) => {
  const { scene } = useThree()
  const meshesRef = useRef<Map<string, THREE.Group>>(new Map())

  useFrame(() => {
    const now = performance.now()

    // Update existing damage numbers
    damageEvents.forEach((event) => {
      let mesh = meshesRef.current.get(event.id)

      if (!mesh) {
        // Create new damage number text
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 128
        const ctx = canvas.getContext('2d')!
        ctx.font = 'bold 60px Arial'
        ctx.fillStyle = '#FF4444'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`-${Math.round(event.amount)}`, 128, 64)

        const texture = new THREE.CanvasTexture(canvas)
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
        const geometry = new THREE.PlaneGeometry(3, 1.5)
        const textMesh = new THREE.Mesh(geometry, material)

        mesh = new THREE.Group()
        mesh.add(textMesh)
        mesh.position.copy(event.position as any)
        mesh.userData.eventId = event.id
        scene.add(mesh)
        meshesRef.current.set(event.id, mesh)
      }

      // Animate position upward and fade out
      const elapsed = (now - event.time) / 1000
      const progress = elapsed / event.duration

      if (progress >= 1) {
        scene.remove(mesh)
        meshesRef.current.delete(event.id)
      } else {
        mesh.position.y += 0.05 // Move up smoothly
        const opacity = 1 - progress
        if (mesh.children[0]) {
          const mat = (mesh.children[0] as any).material
          if (mat) mat.opacity = opacity
        }
      }
    })
  })

  return null
}
