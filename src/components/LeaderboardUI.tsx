import { useState, useEffect } from 'react'
import { DevvitApi } from '../services/DevvitApi'
import type { GameEngine } from '../engine/GameEngine'

interface LeaderboardUIProps {
  engine: GameEngine
  postId?: string
}

export const LeaderboardUI: React.FC<LeaderboardUIProps> = ({ engine, postId = 'demo-rook-1' }) => {
  const [api] = useState(() => new DevvitApi(postId))
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [brainValue, setBrainValue] = useState(0)
  const [fastestCollapse, setFastestCollapse] = useState(Infinity)

  // Periodically fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const rookState = await api.getRookState()
      setLeaderboard(rookState.leaderboard)
      setBrainValue(rookState.brain_value)
      setFastestCollapse(rookState.fastest_collapse)
    }

    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 5000)
    return () => clearInterval(interval)
  }, [api])

  // Submit attack when battle ends
  useEffect(() => {
    const checkForBattleEnd = setInterval(async () => {
      const replayData = engine.getReplayData()
      if (replayData && !(replayData as any)._submitted) {
        // Mark as submitted to avoid double-posting
        const timeSurvived = replayData.duration
        const damageTaken = 100 - replayData.finalRookHp

        await api.submitAttack({
          player_name: 'Anonymous Attacker',
          wave_config: 'mixed',
          time_survived: timeSurvived,
          damage_dealt: damageTaken,
          replay_seed: replayData.seed,
        })

        // Mark as submitted
        ;(replayData as any)._submitted = true
      }
    }, 1000)

    return () => clearInterval(checkForBattleEnd)
  }, [engine, api])

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        background: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #2196F3',
        borderRadius: 8,
        padding: '16px',
        fontFamily: 'monospace',
        color: '#fff',
        maxWidth: '300px',
        maxHeight: '400px',
        overflowY: 'auto',
        backdropFilter: 'blur(4px)',
        zIndex: 40,
      }}
    >
      <div
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '12px',
          borderBottom: '2px solid #2196F3',
          paddingBottom: '8px',
        }}
      >
        🏆 LEADERBOARD
      </div>

      <div style={{ fontSize: '11px', marginBottom: '12px', opacity: 0.8 }}>
        <div>Brain Value: {brainValue}</div>
        <div>
          Fastest Collapse:{' '}
          {fastestCollapse === Infinity ? 'Undefeated' : `${fastestCollapse.toFixed(1)}s`}
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div style={{ fontSize: '11px', opacity: 0.6, fontStyle: 'italic' }}>
          No attacks yet.
          <br />
          Be the first to challenge this rook!
        </div>
      ) : (
        <div style={{ fontSize: '10px' }}>
          {leaderboard.slice(0, 10).map((entry, i) => (
            <div key={i} style={{ marginBottom: '6px', opacity: 0.9 }}>
              <span style={{ color: '#FFD700', fontWeight: 'bold' }}>#{i + 1}</span>{' '}
              <span style={{ color: '#4CAF50' }}>{entry.player}</span>
              <div style={{ marginLeft: '12px', opacity: 0.7 }}>
                {entry.time_survived.toFixed(1)}s / {entry.damage_dealt} dmg
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          fontSize: '9px',
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          opacity: 0.6,
        }}
      >
        Updates every 5s
      </div>
    </div>
  )
}
