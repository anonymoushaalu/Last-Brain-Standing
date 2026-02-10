import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'

export function FPSMonitor() {
  const [fps, setFps] = useState(0)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())

  useFrame(() => {
    frameCountRef.current++
    const now = performance.now()
    const elapsed = now - lastTimeRef.current

    if (elapsed >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / elapsed))
      frameCountRef.current = 0
      lastTimeRef.current = now
    }
  })

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      left: 10,
      color: '#00ff00',
      fontFamily: 'monospace',
      fontSize: 14,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '8px 12px',
      borderRadius: 4,
      zIndex: 100,
      border: '1px solid #00ff00'
    }}>
      FPS: {fps}
    </div>
  )
}
