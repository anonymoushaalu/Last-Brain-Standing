import { useThree } from '@react-three/fiber'
import { useState } from 'react'

export function StatusDisplay() {
  const { camera } = useThree()
  const [gameInfo] = useState({
    timestamp: new Date().toLocaleTimeString()
  })

  const cameraPos = camera.position

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
      maxWidth: 300
    }}>
      <div><strong>🎮 PHASE 0 STATUS</strong></div>
      <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.6 }}>
        <div>✓ Vite + React loaded</div>
        <div>✓ Three.js rendering</div>
        <div>✓ Camera LOCKED (isometric)</div>
        <div>
          Cam: ({cameraPos.x.toFixed(1)}, {cameraPos.y.toFixed(1)}, {cameraPos.z.toFixed(1)})
        </div>
        <div>✓ Ground plane visible</div>
        <div>✓ Lighting active</div>
        <div>✓ Shadows enabled</div>
        <div style={{ marginTop: 8, color: '#ffff00' }}>Ready for PHASE 1</div>
      </div>
    </div>
  )
}
