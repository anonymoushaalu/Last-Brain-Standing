/**
 * Devvit Integration Layer
 * Handles communication with Reddit/Devvit servers
 * Uses localStorage for demo (production uses Devvit backend)
 */

interface RookState {
  brain_value: number
  fastest_collapse: number
  leaderboard: Array<{
    player: string
    time_survived: number
    damage_dealt: number
  }>
}

interface AttackPayload {
  player_name: string
  wave_config: string
  time_survived: number
  damage_dealt: number
  replay_seed: string | number
}

export class DevvitApi {
  private postId: string
  private storageKey: string

  constructor(postId: string) {
    this.postId = postId
    this.storageKey = `rook-${postId}-state`
  }

  /**
   * Get current rook state (uses localStorage in demo mode)
   */
  async getRookState(): Promise<RookState> {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const state = JSON.parse(stored)
        // Handle Infinity being converted to null during JSON serialization
        if (state.fastest_collapse === null) {
          state.fastest_collapse = Infinity
        }
        return state
      }
    } catch (e) {
      console.warn('[DevvitApi] Failed to read rook state from storage:', e)
    }

    // Return default empty state
    return {
      brain_value: 0,
      fastest_collapse: Infinity,
      leaderboard: [],
    }
  }

  /**
   * Submit an attack and update leaderboard
   */
  async submitAttack(attack: AttackPayload): Promise<void> {
    try {
      const state = await this.getRookState()

      // Add to leaderboard
      state.leaderboard.push({
        player: attack.player_name,
        time_survived: attack.time_survived,
        damage_dealt: attack.damage_dealt,
      })

      // Sort by damage dealt (descending)
      state.leaderboard.sort((a, b) => b.damage_dealt - a.damage_dealt)

      // Keep only top 50
      state.leaderboard = state.leaderboard.slice(0, 50)

      // Update fastest collapse time (if rook was defeated)
      if (attack.damage_dealt === 100) {
        state.fastest_collapse = Math.min(state.fastest_collapse, attack.time_survived)
      }

      // Update brain value
      state.brain_value += attack.damage_dealt

      // Save updated state
      localStorage.setItem(this.storageKey, JSON.stringify(state))

      console.log('[DevvitApi] Attack submitted and recorded locally:', attack)
    } catch (error) {
      console.error('[DevvitApi] Error submitting attack:', error)
    }
  }
  /**
   * Clear all data for this rook (testing utility)
   */
  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey)
      console.log('[DevvitApi] Cleared all data for post:', this.postId)
    } catch (e) {
      console.error('[DevvitApi] Failed to clear data:', e)
    }
  }
}