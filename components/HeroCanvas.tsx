'use client'

import { Environment, Lightformer, MeshDistortMaterial } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { type ComponentRef, type MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type InteractionState = { active: boolean; coarse: boolean; pointerId: number | null; reducedMotion: boolean; x: number; y: number }
type MotionPreferences = Pick<InteractionState, 'coarse' | 'reducedMotion'>
type LiquidChromeProps = { interaction: MutableRefObject<InteractionState>; preferences: MotionPreferences; scrollProgress: MutableRefObject<number> }

const INITIAL_INTERACTION: InteractionState = { active: false, coarse: false, pointerId: null, reducedMotion: false, x: 0, y: 0 }
// Icosahedron detail is recursive: 20 × 4^detail faces. Detail 5 preserves high-DPR performance.
const LIQUID_MESH_DETAIL = 5
const trajectory = [
  { at: 0, x: 0, y: 0, scale: 1.08, rx: 0, ry: 0, rz: 0, distort: 0.16 },
  { at: 0.26, x: 1.62, y: 0.08, scale: 0.78, rx: 0.08, ry: 1.05, rz: -0.08, distort: 0.24 },
  { at: 0.6, x: -1.52, y: -0.12, scale: 0.84, rx: -0.22, ry: 2.5, rz: 0.1, distort: 0.48 },
  { at: 1, x: 0, y: 0.03, scale: 0.94, rx: 0, ry: Math.PI * 3, rz: 0, distort: 0.2 },
] as const

const damp = (current: number, target: number, smoothing: number, delta: number) => THREE.MathUtils.damp(current, target, smoothing, delta)

function interpolateTrajectory(progress: number) {
  const clamped = THREE.MathUtils.clamp(progress, 0, 1)
  const nextIndex = trajectory.findIndex((point) => point.at >= clamped)
  const upperIndex = nextIndex === -1 ? trajectory.length - 1 : nextIndex
  const lower = trajectory[Math.max(upperIndex - 1, 0)]
  const upper = trajectory[upperIndex]
  const mix = THREE.MathUtils.smoothstep((clamped - lower.at) / Math.max(upper.at - lower.at, 0.0001), 0, 1)
  return {
    x: THREE.MathUtils.lerp(lower.x, upper.x, mix), y: THREE.MathUtils.lerp(lower.y, upper.y, mix), scale: THREE.MathUtils.lerp(lower.scale, upper.scale, mix),
    rx: THREE.MathUtils.lerp(lower.rx, upper.rx, mix), ry: THREE.MathUtils.lerp(lower.ry, upper.ry, mix), rz: THREE.MathUtils.lerp(lower.rz, upper.rz, mix), distort: THREE.MathUtils.lerp(lower.distort, upper.distort, mix),
  }
}

function createSeededRandom(seed: number) {
  let value = seed >>> 0
  return () => { value += 0x6d2b79f5; let result = value; result = Math.imul(result ^ (result >>> 15), result | 1); result ^= result + Math.imul(result ^ (result >>> 7), result | 61); return ((result ^ (result >>> 14)) >>> 0) / 4294967296 }
}

function Atmosphere({ coarse, reducedMotion }: MotionPreferences) {
  const pointsRef = useRef<THREE.Points | null>(null)
  const positions = useMemo(() => {
    const random = createSeededRandom(0x06b6d4); const count = coarse ? 72 : 150; const data = new Float32Array(count * 3)
    for (let index = 0; index < count; index += 1) { const radius = 3.2 + random() * 5.6; const azimuth = random() * Math.PI * 2; const elevation = (random() - 0.5) * Math.PI; const offset = index * 3; data[offset] = Math.cos(azimuth) * Math.cos(elevation) * radius; data[offset + 1] = Math.sin(elevation) * radius * 0.72; data[offset + 2] = Math.sin(azimuth) * Math.cos(elevation) * radius - 1.3 }
    return data
  }, [coarse])
  useFrame((state) => { if (pointsRef.current) pointsRef.current.rotation.y = state.clock.getElapsedTime() * (reducedMotion ? 0.008 : 0.026) })
  return <points ref={pointsRef} frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#67dced" depthWrite={false} opacity={0.46} size={0.028} sizeAttenuation transparent /></points>
}

function LiquidChrome({ interaction, preferences, scrollProgress }: LiquidChromeProps) {
  const groupRef = useRef<THREE.Group | null>(null)
  const materialRef = useRef<ComponentRef<typeof MeshDistortMaterial> | null>(null)
  const smoothedPointer = useRef(new THREE.Vector2())
  useFrame((state, delta) => {
    const group = groupRef.current; const material = materialRef.current
    if (!group || !material) return
    const elapsed = state.clock.getElapsedTime(); const input = interaction.current; const isTouching = input.coarse && input.active; const path = interpolateTrajectory(scrollProgress.current)
    const inputX = input.coarse ? (isTouching ? input.x : 0) : state.pointer.x; const inputY = input.coarse ? (isTouching ? input.y : 0) : state.pointer.y
    smoothedPointer.current.x = damp(smoothedPointer.current.x, inputX, isTouching ? 10 : 5.5, delta); smoothedPointer.current.y = damp(smoothedPointer.current.y, inputY, isTouching ? 10 : 5.5, delta)
    const motionScale = input.reducedMotion ? 0.14 : 1; const ambient = Math.sin(elapsed * 0.78); const pointerX = smoothedPointer.current.x; const pointerY = smoothedPointer.current.y; const mobileScrollLift = input.coarse ? (scrollProgress.current - 0.5) * -0.42 : 0
    group.position.x = damp(group.position.x, path.x + pointerX * (isTouching ? 0.3 : 0.08), 4.6, delta); group.position.y = damp(group.position.y, path.y + mobileScrollLift + pointerY * (isTouching ? 0.26 : 0.06), 4.6, delta)
    group.rotation.x = damp(group.rotation.x, path.rx - pointerY * 0.25 * motionScale + ambient * 0.045, 4.4, delta); group.rotation.y = damp(group.rotation.y, path.ry + pointerX * 0.36 * motionScale + elapsed * 0.05, 4.2, delta); group.rotation.z = damp(group.rotation.z, path.rz + pointerX * pointerY * 0.08 + ambient * 0.02, 4, delta)
    const scaleTarget = (preferences.coarse ? 0.8 : 1) * path.scale * (1 + ambient * 0.027 * motionScale + (isTouching ? 0.03 : 0)); const scale = damp(group.scale.x, scaleTarget, 4.6, delta); group.scale.setScalar(scale)
    material.distort = damp(material.distort, path.distort + (isTouching ? (Math.abs(pointerX) + Math.abs(pointerY)) * 0.08 : 0) + ambient * 0.04, 5, delta)
  })
  return <group ref={groupRef}><mesh><icosahedronGeometry args={[1.8, LIQUID_MESH_DETAIL]} /><MeshDistortMaterial ref={materialRef} clearcoat={1} clearcoatRoughness={0.06} color="#eefcff" distort={0.2} envMapIntensity={2.2} metalness={0.92} radius={1} roughness={0.13} speed={preferences.reducedMotion ? 0.1 : 0.85} /></mesh></group>
}

function Scene({ interaction, preferences, scrollProgress }: LiquidChromeProps) {
  return <><ambientLight color="#e7f7ff" intensity={1.7} /><pointLight color="#06b6d4" intensity={14} position={[3.5, 2.5, 4]} /><pointLight color="#a855f7" intensity={12} position={[-3.5, -2, 3]} /><Atmosphere {...preferences} /><LiquidChrome interaction={interaction} preferences={preferences} scrollProgress={scrollProgress} /><Environment frames={1} resolution={128}><group rotation={[0, 0, Math.PI / 5]}><Lightformer color="#d8fbff" form="rect" intensity={6} position={[0, 4, -2]} rotation={[Math.PI / 2, 0, 0]} scale={[7, 1.1, 1]} /><Lightformer color="#06b6d4" form="circle" intensity={5} position={[-4, 0, 1]} rotation={[0, Math.PI / 2, 0]} scale={2.8} /><Lightformer color="#a855f7" form="ring" intensity={4} position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={3.5} /></group></Environment></>
}

export default function HeroCanvas() {
  const interaction = useRef<InteractionState>({ ...INITIAL_INTERACTION }); const scrollProgress = useRef(0); const { scrollYProgress } = useScroll(); const [preferences, setPreferences] = useState<MotionPreferences>({ coarse: false, reducedMotion: false })
  useMotionValueEvent(scrollYProgress, 'change', (latest) => { scrollProgress.current = latest })
  useEffect(() => {
    if (typeof window === 'undefined') return
    const coarseQuery = window.matchMedia('(pointer: coarse)'); const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => { const next = { coarse: coarseQuery.matches, reducedMotion: reducedMotionQuery.matches }; interaction.current.coarse = next.coarse; interaction.current.reducedMotion = next.reducedMotion; setPreferences(next) }
    const update = (clientX: number, clientY: number) => { interaction.current.x = THREE.MathUtils.clamp((clientX / Math.max(window.innerWidth, 1)) * 2 - 1, -1, 1); interaction.current.y = THREE.MathUtils.clamp(-(clientY / Math.max(window.innerHeight, 1)) * 2 + 1, -1, 1) }
    const down = (event: PointerEvent) => { if (event.pointerType !== 'touch' && !coarseQuery.matches) return; interaction.current.active = true; interaction.current.pointerId = event.pointerId; update(event.clientX, event.clientY) }
    const move = (event: PointerEvent) => { if (event.pointerType === 'mouse') { update(event.clientX, event.clientY); return } if (interaction.current.active && (interaction.current.pointerId === null || event.pointerId === interaction.current.pointerId)) update(event.clientX, event.clientY) }
    const end = (event: PointerEvent) => { if (interaction.current.pointerId === null || event.pointerId === interaction.current.pointerId) { interaction.current.active = false; interaction.current.pointerId = null } }
    sync(); coarseQuery.addEventListener('change', sync); reducedMotionQuery.addEventListener('change', sync); window.addEventListener('pointerdown', down, { passive: true }); window.addEventListener('pointermove', move, { passive: true }); window.addEventListener('pointerup', end, { passive: true }); window.addEventListener('pointercancel', end, { passive: true })
    return () => { coarseQuery.removeEventListener('change', sync); reducedMotionQuery.removeEventListener('change', sync); window.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end) }
  }, [])
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.96),rgba(248,250,252,0.42)_38%,transparent_68%),radial-gradient(circle_at_14%_25%,rgba(6,182,212,0.15),transparent_27%),radial-gradient(circle_at_88%_55%,rgba(168,85,247,0.13),transparent_31%)]" /><Canvas camera={{ fov: 42, near: 0.1, far: 40, position: [0, 0, 7] }} dpr={[1, 2]} fallback={<div className="absolute inset-0 bg-[#f8fafc]" />} gl={{ alpha: true, antialias: true, depth: true, powerPreference: 'high-performance', stencil: false }} onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.28; gl.setClearColor('#f8fafc', 0) }}><Scene interaction={interaction} preferences={preferences} scrollProgress={scrollProgress} /></Canvas></div>
}
