import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Archer } from '../engine/entities'

interface ArcherVisualsProps {
  archers: Archer[]
}

export const ArcherVisuals: React.FC<ArcherVisualsProps> = ({ archers }) => {
  const { scene } = useThree()

  useEffect(() => {
    // Create archer models (small figures on crenellations)
    archers.forEach((archer) => {
      const group = new THREE.Group()
      group.position.copy(archer.position as any)
      group.userData.archerId = archer.id

      // Archer body (thin cylinder)
      const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8)
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown
        metalness: 0.3,
        roughness: 0.8,
      })
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
      body.position.y = 0.3
      body.castShadow = true
      group.add(body)

      // Archer head (sphere)
      const headGeometry = new THREE.SphereGeometry(0.12, 8, 8)
      const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xDEB887, // Tan skin
        metalness: 0,
        roughness: 0.8,
      })
      const head = new THREE.Mesh(headGeometry, headMaterial)
      head.position.y = 0.75
      head.castShadow = true
      group.add(head)

      // Bow (simple rectangle)
      const bowGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.08)
      const bowMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321, // Dark brown
        metalness: 0.4,
        roughness: 0.6,
      })
      const bow = new THREE.Mesh(bowGeometry, bowMaterial)
      bow.position.set(0.08, 0.5, 0)
      bow.castShadow = true
      group.add(bow)

      scene.add(group)

      return () => {
        scene.remove(group)
        bodyGeometry.dispose()
        bodyMaterial.dispose()
        headGeometry.dispose()
        headMaterial.dispose()
        bowGeometry.dispose()
        bowMaterial.dispose()
      }
    })

    return () => {
      // Cleanup accomplished by removing group
    }
  }, [archers, scene])

  return null
}
