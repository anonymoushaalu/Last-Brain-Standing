/**
 * Devvit Integration Layer
 * Handles communication with Reddit/Devvit servers
 */

interface RookPostData {
  rook_id: string
  brain_value: number
  fastest_collapse: number
  total_attacks: number
  leaderboard: Array<{
    player: string
    time_survived: number
    damage_dealt: number
    rank: number
  }>
}

interface AttackSubmission {
  player_name: string
  wave_config: string
  time_survived: number
  damage_dealt: number
  replay_seed: string | number
}

export class DevvitApi {
  private postId: string
  private baseUrl: string = process.env.REACT_APP_DEVVIT_API_URL || 'http://localhost:3000'

  constructor(postId: string) {
    this.postId = postId
  }

  /**
   * Fetch current rook state from post
   */
  async getRookState(): Promise<RookPostData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rooks/${this.postId}`)
      if (!response.ok) throw new Error('Failed to fetch rook state')
      return response.json()
    } catch (error) {
      console.error('[DevvitApi] Error fetching rook state:', error)
      // Return mock data for demo
      return {
        rook_id: this.postId,
        brain_value: 0,
        fastest_collapse: Infinity,
        total_attacks: 0,
        leaderboard: [],
      }
    }
  }

  /**
   * Submit a siege attack result
   */
  async submitAttack(attack: AttackSubmission): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rooks/${this.postId}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attack),
      })
      if (!response.ok) throw new Error('Failed to submit attack')
      console.log('[DevvitApi] Attack submitted successfully')
    } catch (error) {
      console.error('[DevvitApi] Error submitting attack:', error)
      // In demo mode, just log success
      console.log('[DevvitApi] Attack recorded locally:', attack)
    }
  }

  /**
   * Get replay data for a specific attack
   */
  async getReplay(replaySeed: string | number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/replays/${replaySeed}`)
      if (!response.ok) throw new Error('Failed to fetch replay')
      return response.json()
    } catch (error) {
      console.error('[DevvitApi] Error fetching replay:', error)
      return null
    }
  }

  /**
   * Update post content with latest leaderboard
   */
  async updatePostContent(content: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rooks/${this.postId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!response.ok) throw new Error('Failed to update post')
    } catch (error) {
      console.error('[DevvitApi] Error updating post:', error)
    }
  }
}

/**
 * Generate Reddit post content with leaderboard
 */
export function generatePostContent(data: RookPostData): string {
  const leaderboardText = data.leaderboard
    .slice(0, 10)
    .map(
      (entry, i) =>
        `${i + 1}. **${entry.player}** - ${entry.time_survived.toFixed(1)}s (${entry.damage_dealt} damage)`
    )
    .join('\n')

  return `
# 🧠 LAST BRAIN STANDING

A rook defends its precious brain from endless zombie waves.

## 💊 Current Brain Value
**${data.brain_value}** infection points

## ⚡ Fastest Collapse
${data.fastest_collapse === Infinity ? 'Challenge not yet defeated' : `${data.fastest_collapse.toFixed(1)}s`}

## 🎮 How to Play
- Add zombie waves below (Runner, Tank, Spitter, Horde)
- Watch the siege unfold with deterministic simulation
- Submit your best attempt

## 🏆 Leaderboard (Top 10)
${leaderboardText || 'No attacks yet. Be the first!'}

## ▶ WATCH REPLAYS
Click the replay button after each battle to watch the siege again with the same result (deterministic magic!)

---
*Powered by seeded RNG determinism. Every attack plays out the same way.*
`
}
