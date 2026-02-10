import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { EffectComposer, RenderPass, EffectPass, BloomEffect as PPBloomEffect } from 'postprocessing'

export function BloomEffect() {
  const { gl, scene, camera, size } = useThree()
  const composerRef = useRef<EffectComposer | null>(null)

  useEffect(() => {
    // Create composer and passes
    const composer = new EffectComposer(gl)
    composer.setSize(size.width, size.height)

    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const bloom = new PPBloomEffect({
      intensity: 1.2,
      luminanceThreshold: 0.4,
      luminanceSmoothing: 0.025,
      blendFunction: 2
    })

    const effectPass = new EffectPass(camera, bloom)
    effectPass.renderToScreen = true
    composer.addPass(effectPass)

    composerRef.current = composer

    const handleResize = () => {
      composerRef.current?.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      composer.dispose()
    }
  }, [gl, scene, camera, size])

  // Render composer every frame after the scene renders
  useFrame((_, delta) => {
    if (composerRef.current) {
      composerRef.current.render(delta)
    }
  }, 100)

  return null
}
