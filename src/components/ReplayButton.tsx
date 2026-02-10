import React, { useState, useEffect } from 'react'
import type { GameEngine } from '../engine/GameEngine'

interface ReplayButtonProps {
  engine: GameEngine
}

export const ReplayButton: React.FC<ReplayButtonProps> = ({ engine }) => {
  const [showButton, setShowButton] = useState(false)
  const [isReplaying, setIsReplaying] = useState(false)

  // Check if replay data is available (battle ended)
  useEffect(() => {
    const interval = setInterval(() => {
      const replayData = engine.getReplayData()
      if (replayData && !showButton) {
        setShowButton(true)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [engine, showButton])

  const handleReplay = () => {
    setIsReplaying(true)
    engine.replay()
    // Hide button while replaying
    setShowButton(false)
    setIsReplaying(false)
  }

  if (!showButton) return null

  return (
    <button
      onClick={handleReplay}
      disabled={isReplaying}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '16px 32px',
        background: '#FF6B35',
        border: 'none',
        color: '#fff',
        borderRadius: 8,
        cursor: isReplaying ? 'not-allowed' : 'pointer',
        fontSize: '18px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        zIndex: 100,
        transition: 'all 0.3s',
        opacity: isReplaying ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isReplaying) {
          ;(e.currentTarget as HTMLElement).style.background = '#FF8C42'
          ;(e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1.05)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isReplaying) {
          ;(e.currentTarget as HTMLElement).style.background = '#FF6B35'
          ;(e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1)'
        }
      }}
    >
      ▶ WATCH SIEGE
    </button>
  )
}
