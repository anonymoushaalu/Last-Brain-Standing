/**
 * Deterministic entity classes for battle simulation
 * No physics engine - distance checks only
 */

export type EntityType = 'rook' | 'zombie' | 'archer'
export type ZombieType = 'basic' | 'fast' | 'tank'

export interface Vector3 {
  x: number
  y: number
  z: number
}

export abstract class Entity {
  id: string
  type: EntityType
  position: Vector3
  hp: number
  maxHp: number
  createdTick: number
  alive: boolean

  constructor(
    id: string,
    type: EntityType,
    maxHp: number,
    position: Vector3,
    createdTick: number
  ) {
    this.id = id
    this.type = type
    this.maxHp = maxHp
    this.hp = maxHp
    this.position = { ...position }
    this.createdTick = createdTick
    this.alive = true
  }

  takeDamage(amount: number) {
    this.hp -= amount
    if (this.hp <= 0) {
      this.hp = 0
      this.alive = false
    }
  }

  distanceTo(other: Vector3): number {
    const dx = this.position.x - other.x
    const dy = this.position.y - other.y
    const dz = this.position.z - other.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }
}

/**
 * Rook - stationary tower to defend
 */
export class Rook extends Entity {
  level: number = 1

  constructor(id: string, maxHp: number, position: Vector3, createdTick: number) {
    super(id, 'rook', maxHp, position, createdTick)
  }
}

/**
 * Zombie - moves toward rook and attacks
 */
export class Zombie extends Entity {
  zombieType: ZombieType
  speed: number // units per tick
  attackRange: number = 1.5
  dps: number // damage per tick

  constructor(
    id: string,
    zombieType: ZombieType = 'basic',
    position: Vector3,
    createdTick: number
  ) {
    let maxHp = 30
    let speed = 0.5
    let dps = 2

    // Vary by zombie type
    if (zombieType === 'fast') {
      maxHp = 15
      speed = 1.2
      dps = 1.5
    } else if (zombieType === 'tank') {
      maxHp = 60
      speed = 0.3
      dps = 3
    }

    super(id, 'zombie', maxHp, position, createdTick)
    this.zombieType = zombieType
    this.speed = speed
    this.dps = dps
  }

  /**
   * Move toward a target position
   * Deterministic pseudo-movement using distance decay
   */
  moveToward(target: Vector3, rng: () => number) {
    const dx = target.x - this.position.x
    const dz = target.z - this.position.z
    const distance = Math.sqrt(dx * dx + dz * dz)

    if (distance > 0) {
      // Normalize direction
      const dirX = dx / distance
      const dirZ = dz / distance

      // Move with slight randomness for deterministic variation
      const randomFactor = 1 + (rng() - 0.5) * 0.1
      this.position.x += dirX * this.speed * randomFactor
      this.position.z += dirZ * this.speed * randomFactor
    }
  }
}

/**
 * Archer - stationary attacker that targets zombies
 */
export class Archer extends Entity {
  range: number
  dps: number
  target: Zombie | null = null

  constructor(id: string, position: Vector3, createdTick: number) {
    super(id, 'archer', 50, position, createdTick)
    this.range = 20
    this.dps = 8
  }

  /**
   * Auto-target nearest zombie in range
   */
  acquireTarget(zombies: Zombie[]): Zombie | null {
    let nearest: Zombie | null = null
    let nearestDist = this.range

    for (const zombie of zombies) {
      if (!zombie.alive) continue
      const dist = this.distanceTo(zombie.position)
      if (dist < nearestDist) {
        nearest = zombie
        nearestDist = dist
      }
    }

    this.target = nearest
    return nearest
  }
}
