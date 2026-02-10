import { useEffect, useState } from 'react'
import type { GameEngine } from '../engine/GameEngine'

interface StatusDisplayProps {
  engine?: GameEngine
}

export function StatusDisplay({ engine }: StatusDisplayProps) {
  const [now, setNow] = useState(() => new Date().toLocaleTimeString())
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    // Update timestamp and logs every 500ms
    const interval = setInterval(() => {
      setNow(new Date().toLocaleTimeString())
      if (engine) {
        setLogs(engine.getLog())
      }
    }, 500)

    // Initial fetch
    if (engine) {
      setLogs(engine.getLog())
    }

    return () => clearInterval(interval)
  }, [engine])

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      color: '#00ff00',
      fontFamily: 'monospace',
      fontSize: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '10px 15px',
      borderRadius: 4,
      zIndex: 100,
      border: '1px solid #00ff00',
      maxWidth: 360,
      pointerEvents: 'none'
    }}>
      <div><strong>🎮 STATUS</strong></div>
      <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.4 }}>
        <div>Time: {now}</div>
        <div style={{ marginTop: 6 }}><strong>Simulation Log</strong></div>
        <div style={{ maxHeight: 160, overflow: 'auto', marginTop: 6 }}>
          {logs.length === 0 && <div style={{ color: '#999' }}>No logs yet</div>}
          {logs.slice().reverse().slice(0, 8).map((l, i) => (
            <div key={i} style={{ fontSize: 11, color: '#ddd' }}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
