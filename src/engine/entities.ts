/**
 * Deterministic entity classes for battle simulation
 * No physics engine - distance checks only
 */

export type EntityType = 'rook' | 'zombie' | 'archer'
export type ZombieType = 'runner' | 'tank' | 'spitter' | 'horde'

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
  attackRange: number
  dps: number // damage per second
  cost: number // infection points cost
  isHordeMini: boolean = false // true if this is a mini zombie from a horde pack

  constructor(
    id: string,
    zombieType: ZombieType = 'runner',
    position: Vector3,
    createdTick: number,
    isHordeMini: boolean = false
  ) {
    let maxHp = 35
    let speed = 0.8
    let dps = 8
    let cost = 15
    let attackRange = 1.5

    // Vary by zombie type
    if (zombieType === 'runner') {
      maxHp = 35
      speed = 1.2 // very fast
      dps = 8
      cost = 15
      attackRange = 1.5
    } else if (zombieType === 'tank') {
      maxHp = 160
      speed = 0.3 // slow
      dps = 14
      cost = 40
      attackRange = 1.5
    } else if (zombieType === 'spitter') {
      maxHp = 55
      speed = 0.6
      dps = 12 // ranged damage
      cost = 25
      attackRange = 8 // ranged attacker
    } else if (zombieType === 'horde') {
      // Horde pack - treated as single unit for now
      maxHp = 30
      speed = 0.5
      dps = 10 // combines 6 mini zombies
      cost = 30
      attackRange = 1.5
    }

    // Mini zombies from horde packs have reduced stats
    if (isHordeMini) {
      maxHp = Math.floor(maxHp * 0.5)
      dps = Math.floor(dps * 0.5)
      cost = 0 // no cost - spawned as part of horde
    }

    super(id, 'zombie', maxHp, position, createdTick)
    this.zombieType = zombieType
    this.speed = speed
    this.dps = dps
    this.cost = cost
    this.attackRange = attackRange
    this.isHordeMini = isHordeMini
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
