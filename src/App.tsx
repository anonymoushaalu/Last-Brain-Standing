import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import GameScene from './components/GameScene'
import { FPSMonitor } from './components/FPSMonitor'
import { StatusDisplay } from './components/StatusDisplay'
import { AttackerUI } from './components/AttackerUI'
import { ReplayButton } from './components/ReplayButton'
import { LeaderboardUI } from './components/LeaderboardUI'
import { GameEngine } from './engine/GameEngine'
import { testDeterministicSimulation } from './engine/test'

// Locked isometric camera component
function LockedCamera() {
  const { camera } = useThree()
  
  useEffect(() => {
    // Isometric view: ~45° angle, orthographic feel
    // Camera height and distance create the tilted perspective
    const distance = 50
    const angle = Math.PI / 4 // 45 degrees
    
    camera.position.x = distance * Math.cos(angle)
    camera.position.y = distance * Math.sin(angle)
    camera.position.z = distance * Math.cos(angle)
    
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  return null
}

export default function App() {
  const [gameEngine] = useState(() => new GameEngine(Math.random()))
  const [mode, setMode] = useState<'attacker' | 'defender'>('defender')
  const [zombieSkin, setZombieSkin] = useState<string>('default')
  const [rookSkin, setRookSkin] = useState<string>('default')

  useEffect(() => {
    gameEngine.start()
    
    console.log('[App] mounted — starting GameEngine')
    // Run deterministic simulation test (logs to browser console)
    testDeterministicSimulation()
    
    return () => gameEngine.stop()
  }, [gameEngine])

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      <Canvas
        camera={{
          position: [35.36, 35.36, 35.36],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        shadows
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <LockedCamera />
        <GameScene engine={gameEngine} zombieSkin={zombieSkin} rookSkin={rookSkin} />
      </Canvas>
      <FPSMonitor />
      <StatusDisplay engine={gameEngine} />
      <AttackerUI engine={gameEngine} mode={mode} onModeChange={(m) => setMode(m)} zombieSkin={zombieSkin} setZombieSkin={setZombieSkin} rookSkin={rookSkin} setRookSkin={setRookSkin} />
      <ReplayButton engine={gameEngine} />
      <LeaderboardUI engine={gameEngine} postId="rook-0" />
      {/* Tiny mode indicator */}
      <div style={{position: 'fixed', top: 12, right: 12, color: '#fff', fontFamily: 'sans-serif', background: 'rgba(0,0,0,0.4)', padding: '6px 8px', borderRadius: 4}}>{mode === 'defender' ? 'Mode: Defender' : 'Mode: Attacker'}</div>
      <div style={{position: 'fixed', bottom: 12, left: 12, color: '#fff', fontFamily: 'sans-serif', background: 'rgba(0,0,0,0.4)', padding: '6px 8px', borderRadius: 4}}>Last Brain Standing</div>
    </div>
  )
}
