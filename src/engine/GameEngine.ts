import seedrandom from 'seedrandom'

export class GameEngine {
  private rng: seedrandom.PRNG
  private tickRate = 10 // ticks per second
  private dt = 1 / this.tickRate // 0.1 seconds per tick
  private currentTick = 0
  private isRunning = false
  private accumulator = 0
  private lastTime = 0

  constructor(seed: string | number) {
    this.rng = seedrandom(String(seed))
  }

  start() {
    this.isRunning = true
    this.lastTime = performance.now()
  }

  stop() {
    this.isRunning = false
  }

  tick() {
    if (!this.isRunning) return

    const now = performance.now()
    const deltaTime = (now - this.lastTime) / 1000 // Convert to seconds
    this.lastTime = now

    // Fixed timestep loop
    this.accumulator += deltaTime
    while (this.accumulator >= this.dt) {
      this.fixedUpdate()
      this.accumulator -= this.dt
      this.currentTick++
    }
  }

  private fixedUpdate() {
    // TODO: Implement deterministic game logic
    // - Update entity positions
    // - Check collisions
    // - Process attacks
    // - Spawn waves
  }

  getTick(): number {
    return this.currentTick
  }

  getRNG(): seedrandom.PRNG {
    return this.rng
  }

  random(): number {
    return this.rng()
  }
}
