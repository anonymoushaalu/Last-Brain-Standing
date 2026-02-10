import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Zombie } from '../engine/entities'

interface ZombieRendererProps {
  zombies: Zombie[]
}

const ZOMBIE_COLOR_MAP: Record<string, string> = {
  runner: '#4CAF50', // Green
  tank: '#FF9800', // Orange
  spitter: '#9C27B0', // Purple
  horde: '#2196F3', // Blue
}

type InstancedMeshMap = Record<string, THREE.InstancedMesh | null>

export const ZombieRenderer: React.FC<ZombieRendererProps> = ({ zombies }) => {
  const { scene } = useThree()
  const instancedMeshesRef = useRef<InstancedMeshMap>({
    runner: null,
    tank: null,
    spitter: null,
    horde: null,
  })

  // Initialize InstancedMesh groups on mount
  useEffect(() => {
    const geometries = {
      runner: new THREE.BoxGeometry(0.4, 0.8, 0.4),
      tank: new THREE.BoxGeometry(0.8, 1.2, 0.8),
      spitter: new THREE.BoxGeometry(0.5, 0.9, 0.5),
      horde: new THREE.BoxGeometry(0.3, 0.6, 0.3),
    }

    const types: Array<'runner' | 'tank' | 'spitter' | 'horde'> = [
      'runner',
      'tank',
      'spitter',
      'horde',
    ]

    types.forEach((type) => {
      if (!instancedMeshesRef.current[type]) {
        const material = new THREE.MeshStandardMaterial({
          color: ZOMBIE_COLOR_MAP[type],
          metalness: 0.3,
          roughness: 0.7,
          emissive: ZOMBIE_COLOR_MAP[type],
          emissiveIntensity: 0.2,
        })
        const mesh = new THREE.InstancedMesh(geometries[type], material, 256) // Max 256 per type
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
        scene.add(mesh)
        instancedMeshesRef.current[type] = mesh
      }
    })

    return () => {
      // Cleanup handled by scene removal
    }
  }, [scene])

  // Update instance transforms and visibility every frame
  useFrame(() => {
    const counts: Record<string, number> = {
      runner: 0,
      tank: 0,
      spitter: 0,
      horde: 0,
    }

    const matrix = new THREE.Matrix4()

    // Sort zombies by type
    zombies.forEach((zombie) => {
      if (!zombie.alive) return

      const typeKey = zombie.zombieType
      const index = counts[typeKey]

      if (index >= 256) {
        console.warn(`Too many ${typeKey} zombies, skipping render`)
        return // Skip if we exceed max instances
      }

      // Set instance position and scale based on health
      const healthPercent = zombie.hp / zombie.maxHp
      const scale = 0.8 + healthPercent * 0.4 // Smaller when damaged

      matrix.setPosition(zombie.position.x, zombie.position.y || 0.5, zombie.position.z)
      matrix.scale(new THREE.Vector3(scale, scale, scale))

      const mesh = instancedMeshesRef.current[typeKey]
      if (mesh) {
        mesh.setMatrixAt(index, matrix)
        counts[typeKey]++
      }
    })

    // Update instance counts for each mesh
    Object.entries(instancedMeshesRef.current).forEach(([type, mesh]) => {
      if (mesh) {
        const count = counts[type]
        mesh.count = count
        mesh.instanceMatrix.needsUpdate = true

        // Update material opacity based on count
        if (mesh.material instanceof THREE.Material) {
          mesh.visible = count > 0
        }
      }
    })
  })

  return null // InstancedMesh is added directly to scene
}
