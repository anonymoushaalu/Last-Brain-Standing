import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Zombie } from '../engine/entities'

interface ZombieRendererProps {
  zombies: Zombie[]
  skinVariant?: string
}

const ZOMBIE_COLOR_MAP: Record<string, string> = {
  runner: '#7FD300', // Bright lime green
  tank: '#FF6B00', // Bright orange
  spitter: '#C700FF', // Bright magenta
  horde: '#00B4D8', // Bright cyan
}

type InstancedMeshMap = Record<string, THREE.InstancedMesh | null>

const DEFAULT_SKIN_COLORS: Record<string, Record<string, string>> = {
  default: {
    runner: '#7FD300',
    tank: '#FF6B00',
    spitter: '#C700FF',
    horde: '#00B4D8',
  },
  plague: {
    runner: '#274E13',
    tank: '#6B2F00',
    spitter: '#5E1E4A',
    horde: '#003E4D',
  },
}

export const ZombieRenderer: React.FC<ZombieRendererProps> = ({ zombies, skinVariant = 'default' }) => {
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
      // Dispose existing if present (skin change)
      if (instancedMeshesRef.current[type]) {
        scene.remove(instancedMeshesRef.current[type]!)
        instancedMeshesRef.current[type] = null
      }
      const color = (DEFAULT_SKIN_COLORS[skinVariant] || DEFAULT_SKIN_COLORS.default)[type]
      const material = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.5,
        roughness: 0.4,
        emissive: color,
        emissiveIntensity: 0.25,
      })
      const mesh = new THREE.InstancedMesh(geometries[type], material, 256) // Max 256 per type
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      scene.add(mesh)
      instancedMeshesRef.current[type] = mesh
    })

    return () => {
      // Cleanup handled by scene removal
    }
  }, [scene, skinVariant])

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
