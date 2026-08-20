'use client'

import { Environment, Lightformer, MeshDistortMaterial } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  type ComponentRef,
  type MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as THREE from 'three'

type InteractionState = {
  active: boolean
  coarse: boolean
  pointerId: number | null
  reducedMotion: boolean
  x: number
  y: number
}

type MotionPreferences = Pick<InteractionState, 'coarse' | 'reducedMotion'>

type LiquidChromeProps = {
  interaction: MutableRefObject<InteractionState>
  preferences: MotionPreferences
}

type AtmosphereProps = {
  count: number
  reducedMotion: boolean
}

const INITIAL_INTERACTION: InteractionState = {
  active: false,
  coarse: false,
  pointerId: null,
  reducedMotion: false,
  x: 0,
  y: 0,
}

// Icosahedron `detail` is recursive (20 × 4^detail faces), not a segment count.
// Detail 5 preserves the intended dense chrome surface without creating the
// impossible 4^48 geometry that would freeze desktop and mobile GPUs.
const LIQUID_MESH_DETAIL = 5

function damp(current: number, target: number, smoothing: number, delta: number) {
  return THREE.MathUtils.damp(current, target, smoothing, delta)
}

function createSeededRandom(seed: number) {
  let value = seed >>> 0

  return () => {
    value += 0x6d2b79f5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function Atmosphere({ count, reducedMotion }: AtmosphereProps) {
  const pointsRef = useRef<THREE.Points | null>(null)

  const positions = useMemo(() => {
    const random = createSeededRandom(0x00f0ff)
    const data = new Float32Array(count * 3)

    for (let index = 0; index < count; index += 1) {
      const radius = 3.1 + random() * 5.4
      const azimuth = random() * Math.PI * 2
      const elevation = (random() - 0.5) * Math.PI
      const offset = index * 3

      data[offset] = Math.cos(azimuth) * Math.cos(elevation) * radius
      data[offset + 1] = Math.sin(elevation) * radius * 0.72
      data[offset + 2] = Math.sin(azimuth) * Math.cos(elevation) * radius - 1.2
    }

    return data
  }, [count])

  useFrame((state) => {
    const points = pointsRef.current
    if (!points) return

    const elapsed = state.clock.getElapsedTime()
    const speed = reducedMotion ? 0.01 : 0.035
    points.rotation.y = elapsed * speed
    points.rotation.x = Math.sin(elapsed * speed * 0.7) * (reducedMotion ? 0.005 : 0.025)
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        blending={THREE.AdditiveBlending}
        color="#75f8ff"
        depthWrite={false}
        opacity={0.72}
        size={0.032}
        sizeAttenuation
        transparent
      />
    </points>
  )
}

function LiquidChrome({ interaction, preferences }: LiquidChromeProps) {
  const groupRef = useRef<THREE.Group | null>(null)
  const materialRef = useRef<ComponentRef<typeof MeshDistortMaterial> | null>(null)
  const smoothedPointer = useRef(new THREE.Vector2())

  useFrame((state, delta) => {
    const group = groupRef.current
    const material = materialRef.current
    if (!group || !material) return

    const elapsed = state.clock.getElapsedTime()
    const input = interaction.current
    const isTouching = input.coarse && input.active
    const motionScale = input.reducedMotion ? 0.12 : 1

    const targetX = input.coarse ? (isTouching ? input.x : 0) : state.pointer.x
    const targetY = input.coarse ? (isTouching ? input.y : 0) : state.pointer.y
    const pointerSmoothing = isTouching ? 10 : 5.5

    smoothedPointer.current.x = damp(
      smoothedPointer.current.x,
      targetX,
      pointerSmoothing,
      delta,
    )
    smoothedPointer.current.y = damp(
      smoothedPointer.current.y,
      targetY,
      pointerSmoothing,
      delta,
    )

    const ambientStrength = input.coarse && !isTouching ? 1 : 0.38
    const breathe = Math.sin(elapsed * 0.78)
    const driftX = Math.sin(elapsed * 0.36 + 0.7)
    const driftY = Math.sin(elapsed * 0.28)
    const pointerX = smoothedPointer.current.x
    const pointerY = smoothedPointer.current.y

    const targetRotationX =
      -pointerY * (isTouching ? 0.48 : 0.24) * motionScale +
      driftY * 0.075 * ambientStrength * motionScale
    const targetRotationY =
      pointerX * (isTouching ? 0.62 : 0.34) * motionScale +
      elapsed * 0.075 * motionScale +
      driftX * 0.09 * ambientStrength * motionScale
    const targetRotationZ =
      pointerX * pointerY * 0.08 * motionScale +
      Math.sin(elapsed * 0.22) * 0.035 * ambientStrength * motionScale

    group.rotation.x = damp(group.rotation.x, targetRotationX, 4.5, delta)
    group.rotation.y = damp(group.rotation.y, targetRotationY, 4.1, delta)
    group.rotation.z = damp(group.rotation.z, targetRotationZ, 3.8, delta)

    const followStrength = isTouching ? 0.34 : 0.08
    group.position.x = damp(
      group.position.x,
      pointerX * followStrength * motionScale,
      5.5,
      delta,
    )
    group.position.y = damp(
      group.position.y,
      pointerY * followStrength * motionScale,
      5.5,
      delta,
    )

    const baseScale = preferences.coarse ? 0.86 : 1
    const breathingScale = 1 + breathe * 0.035 * ambientStrength * motionScale
    const touchScale = isTouching ? 1.035 : 1
    const nextScale = baseScale * breathingScale * touchScale
    const currentScale = group.scale.x
    const scale = damp(currentScale, nextScale, 4.8, delta)
    group.scale.setScalar(scale)

    const targetDistort =
      0.3 +
      (breathe * 0.5 + 0.5) * 0.1 * ambientStrength * motionScale +
      (isTouching ? (Math.abs(pointerX) + Math.abs(pointerY)) * 0.09 : 0)
    material.distort = damp(material.distort, targetDistort, 5, delta)
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.8, LIQUID_MESH_DETAIL]} />
        <MeshDistortMaterial
          ref={materialRef}
          clearcoat={1}
          clearcoatRoughness={0.08}
          color="#d9fdff"
          distort={0.34}
          envMapIntensity={2.8}
          metalness={1}
          radius={1}
          roughness={0.09}
          speed={preferences.reducedMotion ? 0.12 : 1.15}
        />
      </mesh>
    </group>
  )
}

function ChromeEnvironment() {
  return (
    <Environment frames={1} resolution={128}>
      <group rotation={[0, 0, Math.PI / 5]}>
        <Lightformer
          color="#00f0ff"
          form="rect"
          intensity={5}
          position={[0, 4, -2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[7, 1.1, 1]}
        />
        <Lightformer
          color="#7000ff"
          form="circle"
          intensity={7}
          position={[-4, 0, 1]}
          rotation={[0, Math.PI / 2, 0]}
          scale={2.8}
        />
        <Lightformer
          color="#ffffff"
          form="rect"
          intensity={4}
          position={[4, 1, 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[4.5, 0.7, 1]}
        />
        <Lightformer
          color="#8d4cff"
          form="ring"
          intensity={3}
          position={[0, -4, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={3.5}
        />
      </group>
    </Environment>
  )
}

function Scene({
  interaction,
  preferences,
}: {
  interaction: MutableRefObject<InteractionState>
  preferences: MotionPreferences
}) {
  return (
    <>
      <ambientLight color="#214c63" intensity={0.7} />
      <pointLight color="#00f0ff" intensity={18} position={[3.5, 2.5, 4]} />
      <pointLight color="#7000ff" intensity={16} position={[-3.5, -2, 3]} />
      <Atmosphere count={preferences.coarse ? 86 : 156} reducedMotion={preferences.reducedMotion} />
      <LiquidChrome interaction={interaction} preferences={preferences} />
      <ChromeEnvironment />
    </>
  )
}

export default function HeroCanvas() {
  const interaction = useRef<InteractionState>({ ...INITIAL_INTERACTION })
  const eventSource =
    typeof document === 'undefined' ? undefined : document.documentElement
  const [preferences, setPreferences] = useState<MotionPreferences>(() => {
    if (typeof window === 'undefined') {
      return { coarse: false, reducedMotion: false }
    }

    return {
      coarse: window.matchMedia('(pointer: coarse)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const coarseQuery = window.matchMedia('(pointer: coarse)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const passiveOptions: AddEventListenerOptions = { passive: true }

    const syncPreferences = () => {
      const nextPreferences = {
        coarse: coarseQuery.matches,
        reducedMotion: reducedMotionQuery.matches,
      }

      interaction.current.coarse = nextPreferences.coarse
      interaction.current.reducedMotion = nextPreferences.reducedMotion
      setPreferences(nextPreferences)
    }

    const updateTouchPosition = (clientX: number, clientY: number) => {
      const width = Math.max(window.innerWidth, 1)
      const height = Math.max(window.innerHeight, 1)
      interaction.current.x = THREE.MathUtils.clamp((clientX / width) * 2 - 1, -1, 1)
      interaction.current.y = THREE.MathUtils.clamp(-(clientY / height) * 2 + 1, -1, 1)
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' && !coarseQuery.matches) return
      interaction.current.active = true
      interaction.current.pointerId = event.pointerId
      updateTouchPosition(event.clientX, event.clientY)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!interaction.current.active) return
      if (
        interaction.current.pointerId !== null &&
        event.pointerId !== interaction.current.pointerId
      ) {
        return
      }
      updateTouchPosition(event.clientX, event.clientY)
    }

    const handlePointerEnd = (event: PointerEvent) => {
      if (
        interaction.current.pointerId !== null &&
        event.pointerId !== interaction.current.pointerId
      ) {
        return
      }
      interaction.current.active = false
      interaction.current.pointerId = null
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (typeof window.PointerEvent !== 'undefined') return
      const touch = event.touches[0]
      if (!touch) return
      interaction.current.active = true
      updateTouchPosition(touch.clientX, touch.clientY)
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (typeof window.PointerEvent !== 'undefined' || !interaction.current.active) return
      const touch = event.touches[0]
      if (!touch) return
      updateTouchPosition(touch.clientX, touch.clientY)
    }

    const handleTouchEnd = () => {
      if (typeof window.PointerEvent !== 'undefined') return
      interaction.current.active = false
    }

    interaction.current.coarse = coarseQuery.matches
    interaction.current.reducedMotion = reducedMotionQuery.matches

    coarseQuery.addEventListener('change', syncPreferences)
    reducedMotionQuery.addEventListener('change', syncPreferences)
    window.addEventListener('pointerdown', handlePointerDown, passiveOptions)
    window.addEventListener('pointermove', handlePointerMove, passiveOptions)
    window.addEventListener('pointerup', handlePointerEnd, passiveOptions)
    window.addEventListener('pointercancel', handlePointerEnd, passiveOptions)
    window.addEventListener('touchstart', handleTouchStart, passiveOptions)
    window.addEventListener('touchmove', handleTouchMove, passiveOptions)
    window.addEventListener('touchend', handleTouchEnd, passiveOptions)
    window.addEventListener('touchcancel', handleTouchEnd, passiveOptions)

    return () => {
      coarseQuery.removeEventListener('change', syncPreferences)
      reducedMotionQuery.removeEventListener('change', syncPreferences)
      window.removeEventListener('pointerdown', handlePointerDown, passiveOptions)
      window.removeEventListener('pointermove', handlePointerMove, passiveOptions)
      window.removeEventListener('pointerup', handlePointerEnd, passiveOptions)
      window.removeEventListener('pointercancel', handlePointerEnd, passiveOptions)
      window.removeEventListener('touchstart', handleTouchStart, passiveOptions)
      window.removeEventListener('touchmove', handleTouchMove, passiveOptions)
      window.removeEventListener('touchend', handleTouchEnd, passiveOptions)
      window.removeEventListener('touchcancel', handleTouchEnd, passiveOptions)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050508]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(0,240,255,0.12),transparent_31%),radial-gradient(circle_at_68%_58%,rgba(112,0,255,0.14),transparent_35%)]" />
      <Canvas
        camera={{ fov: 42, near: 0.1, far: 40, position: [0, 0, 7] }}
        dpr={[1, 2]}
        eventPrefix="client"
        eventSource={eventSource}
        fallback={<div className="absolute inset-0 bg-[#050508]" />}
        gl={{
          alpha: true,
          antialias: true,
          depth: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.15
          gl.setClearColor('#050508', 0)
        }}
      >
        <Scene interaction={interaction} preferences={preferences} />
      </Canvas>
    </div>
  )
}
