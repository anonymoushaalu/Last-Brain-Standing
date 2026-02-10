import seedrandom from 'seedrandom'
import { Rook, Zombie, Archer, Vector3 } from './entities'

export interface Arrow {
  id: string
  origin: Vector3
  target: Vector3
  progress: number // 0 to 1
  archerSet: string
  targetId: string
  damage: number
  speed: number // units per second
}

export interface DamageEvent {
  id: string
  position: Vector3
  amount: number
  time: number
  duration: number
}

export class GameEngine {
  private rng: () => number
  private tickRate = 10 // ticks per second
  private dt = 1 / this.tickRate // 0.1 seconds per tick
  private currentTick = 0
  private isRunning = false
  private accumulator = 0
  private lastTime = 0

  // Entities
  private rook: Rook | null = null
  private zombies: Zombie[] = []
  private archers: Archer[] = []
  private arrows: Arrow[] = []

  // Effects
  private damageEvents: DamageEvent[] = []
  private timeScale: number = 1 // For slow-mo effects
  private lastDamageTime: number = 0

  // Simulation configuration
  private waveNumber = 0
  private ticksToSpawn = 50
  private zombiesSpawned = 0
  private arrowId = 0
  private damageEventId = 0

  // Debug/logging
  private simulationLog: string[] = []

  constructor(seed: string | number) {
    this.rng = seedrandom(String(seed))
  }

  // Expose simulation log for UI debugging
  getLog(): string[] {
    return this.simulationLog.slice(-50)
  }

  start() {
    this.isRunning = true
    this.lastTime = performance.now()

    // Initialize rook at center
    this.rook = new Rook('rook-0', 100, { x: 0, y: 0, z: 0 }, 0)

    // Spawn initial archer defenders
    this.spawnArcher([5, 0, 5], 0)
    this.spawnArcher([5, 0, -5], 0)
    this.spawnArcher([-5, 0, 5], 0)
  }

  stop() {
    this.isRunning = false
    this.printLog()
  }

  tick() {
    if (!this.isRunning) return

    const now = performance.now()
    const deltaTime = (now - this.lastTime) / 1000 // Convert to seconds
    this.lastTime = now

    // Apply time scale (for slow-mo effects)
    const scaledDeltaTime = deltaTime * this.timeScale

    // Decay timeScale back to 1 over time
    if (this.timeScale < 1) {
      this.timeScale = Math.min(1, this.timeScale + deltaTime * 2) // Recover at 2x speed
    }

    // Fixed timestep loop
    this.accumulator += scaledDeltaTime
    while (this.accumulator >= this.dt) {
      this.fixedUpdate()
      this.accumulator -= this.dt
      this.currentTick++
    }

    // Clean up old damage events
    const now_ms = performance.now()
    this.damageEvents = this.damageEvents.filter((e) => now_ms - e.time < e.duration * 1000)
  }

  private fixedUpdate() {
    // Spawn zombies in waves
    this.spawnWave()

    // Zombie movement
    for (const zombie of this.zombies) {
      if (!zombie.alive) continue
      zombie.moveToward(this.rook!.position, () => this.rng())
    }

    // Archer targeting and arrow firing
    for (const archer of this.archers) {
      const target = archer.acquireTarget(this.zombies)
      if (target && target.alive) {
        const dist = archer.distanceTo(target.position)
        if (dist <= archer.range) {
          // Fire an arrow (projectile) instead of instant damage
          const arrow: Arrow = {
            id: `arrow-${this.arrowId++}`,
            origin: { ...archer.position },
            target: { ...target.position },
            progress: 0,
            archerSet: archer.id,
            targetId: target.id,
            damage: archer.dps * this.dt,
            speed: 30, // units per second
          }
          this.arrows.push(arrow)
        }
      }
    }

    // Update arrow positions and check for hits
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i]
      
      // Move arrow toward target
      const dx = arrow.target.x - arrow.origin.x
      const dy = arrow.target.y - arrow.origin.y
      const dz = arrow.target.z - arrow.origin.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      
      arrow.progress += (arrow.speed * this.dt) / dist
      
      if (arrow.progress >= 1) {
        // Arrow reached target, find zombie and deal damage
        const target = this.zombies.find((z) => z.id === arrow.targetId)
        if (target && target.alive) {
          target.takeDamage(arrow.damage)
          // Create damage event for floating number
          this.damageEvents.push({
            id: `dmg-${this.damageEventId++}`,
            position: { ...target.position },
            amount: arrow.damage,
            time: performance.now(),
            duration: 0.8,
          })
          this.lastDamageTime = performance.now()
          this.log(
            `[Tick ${this.currentTick}] Arrow ${arrow.id} hits ${target.id} for ${arrow.damage.toFixed(1)} dmg`
          )
        }
        // Remove arrow
        this.arrows.splice(i, 1)
      }
    }

    // Zombie attacks on rook
    if (this.rook && this.rook.alive) {
      for (const zombie of this.zombies) {
        if (!zombie.alive) continue
        const dist = zombie.distanceTo(this.rook.position)
        if (dist <= zombie.attackRange) {
          const dmg = zombie.dps * this.dt
          this.rook.takeDamage(dmg)
          // Create damage event for rook damage
          this.damageEvents.push({
            id: `dmg-${this.damageEventId++}`,
            position: { ...this.rook.position },
            amount: dmg,
            time: performance.now(),
            duration: 0.8,
          })
          this.lastDamageTime = performance.now()
          this.log(
            `[Tick ${this.currentTick}] Zombie ${zombie.id} hits Rook for ${dmg.toFixed(1)} dmg (Rook HP: ${this.rook.hp.toFixed(1)})`
          )
        }
      }
    }

    // Remove dead entities
    this.zombies = this.zombies.filter((z) => z.alive)

    // Check win/loss conditions
    if (this.rook && !this.rook.alive) {
      this.log(`[Tick ${this.currentTick}] 🔴 ROOK DEFEATED`)
      this.timeScale = 0.3 // Slow-mo on death
      this.stop()
    }

    // Check if all zombies dead and no more spawning
    if (
      this.zombies.length === 0 &&
      this.currentTick > this.ticksToSpawn &&
      this.zombiesSpawned > 0
    ) {
      this.log(`[Tick ${this.currentTick}] 🟢 VICTORY - All zombies defeated`)
      this.stop()
    }
  }

  private spawnWave() {
    // Simple wave system: spawn zombies every 30 ticks for 5 waves
    if (this.currentTick % 30 === 0 && this.waveNumber < 5) {
      const zombieCount = 5 + this.waveNumber * 3 // More zombies per wave
      for (let i = 0; i < zombieCount; i++) {
        // Spawn in a circle around the rook
        const angle = (i / zombieCount) * Math.PI * 2
        const dist = 30 + this.rng() * 5
        const x = Math.cos(angle) * dist
        const z = Math.sin(angle) * dist

        // New types with varied distribution
        const types: ('runner' | 'tank' | 'spitter' | 'horde')[] = [
          'runner',
          'runner',
          'tank',
          'spitter',
          'horde',
        ]
        const typeIndex = Math.floor(this.rng() * types.length)

        this.spawnZombie([x, 0, z], types[typeIndex])
        this.zombiesSpawned++

        // Horde packs spawn 6 mini zombies
        if (types[typeIndex] === 'horde') {
          for (let h = 0; h < 6; h++) {
            const hAngle = (h / 6) * Math.PI * 2
            const hDist = 2 + this.rng() * 1
            const hx = x + Math.cos(hAngle) * hDist
            const hz = z + Math.sin(hAngle) * hDist
            this.spawnZombie([hx, 0, hz], 'runner', true)
          }
        }
      }

      this.waveNumber++
      this.log(`[Tick ${this.currentTick}] 🧟 WAVE ${this.waveNumber} SPAWNED (${zombieCount} enemies)`)
      this.ticksToSpawn = this.currentTick + 200 // Stop spawning after all waves
    }
  }

  private spawnZombie(
    position: [number, number, number],
    type: 'runner' | 'tank' | 'spitter' | 'horde',
    isHordeMini: boolean = false
  ) {
    const id = `z-${this.zombies.length + 1}`
    const zombie = new Zombie(
      id,
      type,
      { x: position[0], y: position[1], z: position[2] },
      this.currentTick,
      isHordeMini
    )
    this.zombies.push(zombie)
  }

  private spawnArcher(position: [number, number, number], tick: number) {
    const id = `archer-${this.archers.length + 1}`
    const archer = new Archer(id, { x: position[0], y: position[1], z: position[2] }, tick)
    this.archers.push(archer)
  }

  private log(msg: string) {
    this.simulationLog.push(msg)
    console.log(msg)
  }

  private printLog() {
    console.log('\n=== SIMULATION COMPLETE ===')
    console.log(`Total ticks: ${this.currentTick}`)
    console.log(`Rook HP: ${this.rook?.hp.toFixed(1) ?? 'N/A'}/${this.rook?.maxHp ?? 'N/A'}`)
    console.log(`Zombies killed: ${this.zombiesSpawned - this.zombies.length}/${this.zombiesSpawned}`)
    console.log(`\n=== FULL LOG ===`)
    this.simulationLog.forEach((line) => console.log(line))
  }

  getTick(): number {
    return this.currentTick
  }

  getRNG(): () => number {
    return this.rng
  }

  random(): number {
    return this.rng()
  }

  // Expose state for rendering
  getRook(): Rook | null {
    return this.rook
  }

  getZombies(): Zombie[] {
    return this.zombies
  }

  getArchers(): Archer[] {
    return this.archers
  }

  getArrows(): Arrow[] {
    return this.arrows
  }

  getDamageEvents(): DamageEvent[] {
    return this.damageEvents
  }

  getLastDamageTime(): number {
    return this.lastDamageTime
  }

  getTimeScale(): number {
    return this.timeScale
  }

  setTimeScale(scale: number) {
    this.timeScale = Math.max(0, Math.min(1, scale))
  }

  get entities() {
    const all: Array<Rook | Zombie | Archer> = []
    if (this.rook) all.push(this.rook)
    all.push(...this.zombies, ...this.archers)
    return all
  }
}
