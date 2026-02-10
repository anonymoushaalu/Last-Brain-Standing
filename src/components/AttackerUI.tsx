import { useState } from 'react'

interface ZombieType {
  id: 'runner' | 'tank' | 'spitter' | 'horde'
  name: string
  cost: number
  icon: string
  color: string
}

const ZOMBIE_TYPES: ZombieType[] = [
  { id: 'runner', name: 'Runner', cost: 15, icon: '🏃', color: '#4CAF50' },
  { id: 'tank', name: 'Tank', cost: 40, icon: '🛡️', color: '#FF9800' },
  { id: 'spitter', name: 'Spitter', cost: 25, icon: '💬', color: '#9C27B0' },
  { id: 'horde', name: 'Horde Pack', cost: 30, icon: '👥', color: '#2196F3' },
]

const TOTAL_BUDGET = 120

export const AttackerUI: React.FC = () => {
  const [wave, setWave] = useState<Array<'runner' | 'tank' | 'spitter' | 'horde'>>([])
  const [isExpanded, setIsExpanded] = useState(true)

  const totalCost = wave.reduce((sum, type) => sum + (ZOMBIE_TYPES.find((z) => z.id === type)?.cost || 0), 0)
  const remaining = TOTAL_BUDGET - totalCost

  const addToWave = (zombieType: 'runner' | 'tank' | 'spitter' | 'horde') => {
    const cost = ZOMBIE_TYPES.find((z) => z.id === zombieType)?.cost || 0
    if (remaining >= cost) {
      setWave([...wave, zombieType])
    }
  }

  const removeFromWave = (index: number) => {
    setWave(wave.filter((_, i) => i !== index))
  }

  const submitWave = () => {
    if (wave.length === 0) return
    console.log('[UI] Submitted wave:', wave)
    // TODO: Send to backend/engine
    setWave([])
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        background: 'rgba(0, 0, 0, 0.9)',
        border: '2px solid #FF6B35',
        borderRadius: 8,
        padding: '16px',
        fontFamily: 'monospace',
        color: '#fff',
        minWidth: '280px',
        maxWidth: '350px',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(255, 107, 53, 0.2)',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '12px',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>⚔️ SIEGE BUILDER {isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <>
          {/* Budget Display */}
          <div
            style={{
              fontSize: '11px',
              marginBottom: '12px',
              padding: '8px',
              background: 'rgba(255, 107, 53, 0.2)',
              borderRadius: 4,
              borderLeft: '2px solid #FF6B35',
            }}
          >
            <div>Budget: {totalCost} / {TOTAL_BUDGET}</div>
            <div style={{ color: remaining < 20 ? '#FF6B35' : '#4CAF50' }}>Remaining: {remaining}</div>
          </div>

          {/* Zombie Type Buttons */}
          <div style={{ marginBottom: '12px' }}>
            {ZOMBIE_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => addToWave(type.id)}
                disabled={remaining < type.cost}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px',
                  marginBottom: '6px',
                  background: remaining < type.cost ? 'rgba(100, 100, 100, 0.5)' : `${type.color}33`,
                  border: `1px solid ${type.color}`,
                  color: remaining < type.cost ? '#999' : '#fff',
                  borderRadius: 4,
                  cursor: remaining < type.cost ? 'not-allowed' : 'pointer',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  transition: 'all 0.2s',
                  opacity: remaining < type.cost ? 0.6 : 1,
                }}
              >
                {type.icon} {type.name} ({type.cost} pts)
              </button>
            ))}
          </div>

          {/* Wave Preview */}
          {wave.length > 0 && (
            <div
              style={{
                marginBottom: '12px',
                padding: '8px',
                background: 'rgba(76, 175, 80, 0.1)',
                borderRadius: 4,
                borderLeft: '2px solid #4CAF50',
                fontSize: '10px',
                maxHeight: '80px',
                overflowY: 'auto',
              }}
            >
              <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>Wave ({wave.length} units):</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {wave.map((type, idx) => {
                  const zType = ZOMBIE_TYPES.find((z) => z.id === type)
                  return (
                    <span
                      key={idx}
                      onClick={() => removeFromWave(idx)}
                      style={{
                        background: zType?.color,
                        padding: '2px 6px',
                        borderRadius: 2,
                        cursor: 'pointer',
                        opacity: 0.8,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLElement).style.opacity = '0.5'
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLElement).style.opacity = '0.8'
                      }}
                    >
                      {zType?.icon}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={submitWave}
            disabled={wave.length === 0}
            style={{
              width: '100%',
              padding: '10px',
              background: wave.length === 0 ? 'rgba(100, 100, 100, 0.5)' : '#FF6B35',
              border: 'none',
              color: '#fff',
              borderRadius: 4,
              cursor: wave.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              opacity: wave.length === 0 ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (wave.length > 0) {
                ;(e.currentTarget as HTMLElement).style.background = '#FF8C42'
              }
            }}
            onMouseLeave={(e) => {
              if (wave.length > 0) {
                ;(e.currentTarget as HTMLElement).style.background = '#FF6B35'
              }
            }}
          >
            ▶ LAUNCH WAVE
          </button>
        </>
      )}
    </div>
  )
}
