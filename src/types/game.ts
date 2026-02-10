/** Core game entities - backed by simple DB */

export interface Rook {
  id: string
  playerId: string
  position: { x: number; y: number; z: number }
  health: number
  maxHealth: number
  level: number
  createdTick: number
}

export interface Attack {
  id: string
  rookId: string
  targetId: string
  damage: number
  type: 'projectile' | 'spell'
  createdTick: number
  resolvedTick?: number
}

export interface Player {
  id: string
  username: string
  score: number
  health: number
  maxHealth: number
  gold: number
  wave: number
  createdAt: number
  lastUpdateTick: number
}

export interface WaveConfig {
  waveNumber: number
  enemyCount: number
  spawns: Array<{
    tick: number
    type: 'zombie' | 'archer'
    health: number
    damage: number
  }>
}

/** Game state - deterministic, replayed from ticks */
export interface GameState {
  tick: number
  players: Map<string, Player>
  rooks: Map<string, Rook>
  attacks: Map<string, Attack>
  waveConfig: WaveConfig
}
