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
    const created: THREE.Object3D[] = []
    const skinColors: Record<string, number> = {
      default: 0x8B4513,
      stone: 0x6E7B8B,
      iron: 0x5C5C66,
    }

    archers.forEach((archer) => {
      const group = new THREE.Group()
      // Elevate archers slightly so they're easily visible on crenellations
      group.position.set(archer.position.x, archer.position.y + 1.2, archer.position.z)
      group.userData.archerId = archer.id

      // Archer body (slightly larger for visibility)
      const bodyGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.8, 8)
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: skinColors.default,
        metalness: 0.3,
        roughness: 0.7,
        emissive: 0x222222,
        emissiveIntensity: 0.05,
      })
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
      body.position.y = 0.4
      body.castShadow = true
      group.add(body)

      // Archer head (slightly bigger)
      const headGeometry = new THREE.SphereGeometry(0.14, 8, 8)
      const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xDEB887,
        metalness: 0,
        roughness: 0.8,
      })
      const head = new THREE.Mesh(headGeometry, headMaterial)
      head.position.y = 0.9
      head.castShadow = true
      group.add(head)

      // Bow (simple rectangle)
      const bowGeometry = new THREE.BoxGeometry(0.12, 0.5, 0.08)
      const bowMaterial = new THREE.MeshStandardMaterial({
        color: 0x4b2e1a,
        metalness: 0.4,
        roughness: 0.6,
      })
      const bow = new THREE.Mesh(bowGeometry, bowMaterial)
      bow.position.set(0.08, 0.55, 0)
      bow.castShadow = true
      group.add(bow)

      scene.add(group)
      created.push(group)
    })

    return () => {
      created.forEach((g) => scene.remove(g))
    }
  }, [archers, scene])

  return null
}
