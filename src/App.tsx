import { Canvas } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import GameScene from './components/GameScene'
import { GameEngine } from './engine/GameEngine'

export default function App() {
  const [gameEngine] = useState(() => new GameEngine(seed = Math.random()))

  useEffect(() => {
    gameEngine.start()
    return () => gameEngine.stop()
  }, [gameEngine])

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      <Canvas
        camera={{
          position: [0, 30, 30],
          fov: 50,
          near: 0.1,
          far: 10000
        }}
        shadows
      >
        <GameScene engine={gameEngine} />
      </Canvas>
    </div>
  )
}
