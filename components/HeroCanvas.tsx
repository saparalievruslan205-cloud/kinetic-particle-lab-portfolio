'use client'

import { Environment, Lightformer } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { type MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type InteractionState = { active: boolean; coarse: boolean; pointerId: number | null; reducedMotion: boolean; x: number; y: number }
type MotionPreferences = Pick<InteractionState, 'coarse' | 'reducedMotion'>
type LiquidChromeProps = { interaction: MutableRefObject<InteractionState>; preferences: MotionPreferences; scrollProgress: MutableRefObject<number> }

const INITIAL_INTERACTION: InteractionState = { active: false, coarse: false, pointerId: null, reducedMotion: false, x: 0, y: 0 }
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

function createRibbonGeometry() {
  const segments = 180
  const widthSegments = 10
  const columns = widthSegments + 1
  const positions = new Float32Array((segments + 1) * columns * 3)
  const uvs = new Float32Array((segments + 1) * columns * 2)
  const indices: number[] = []
  const pointAt = (t: number) => new THREE.Vector3(
    Math.sin(t) * 1.58,
    Math.sin(t * 2.15) * 0.42,
    Math.cos(t * 1.35) * 0.62,
  )

  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments
    const t = THREE.MathUtils.lerp(-Math.PI * 1.14, Math.PI * 1.14, progress)
    const center = pointAt(t)
    const ahead = pointAt(t + 0.012)
    const tangent = ahead.sub(center).normalize()
    const side = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize()
    const width = 0.22 + Math.sin(progress * Math.PI) * 0.18
    for (let widthIndex = 0; widthIndex <= widthSegments; widthIndex += 1) {
      const lateral = THREE.MathUtils.lerp(-1, 1, widthIndex / widthSegments)
      const centerWeight = 1 - lateral * lateral
      const point = center.clone().addScaledVector(side, width * lateral)
      // A subtle crown turns the ribbon from a flat strip into a soft liquid membrane.
      point.z += centerWeight * (0.055 + Math.sin(progress * Math.PI * 3) * 0.035)
      const vertexIndex = index * columns + widthIndex
      positions.set([point.x, point.y, point.z], vertexIndex * 3)
      uvs.set([progress, widthIndex / widthSegments], vertexIndex * 2)
    }

    if (index < segments) {
      for (let widthIndex = 0; widthIndex < widthSegments; widthIndex += 1) {
        const base = index * columns + widthIndex
        indices.push(base, base + columns, base + 1, base + 1, base + columns, base + columns + 1)
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.userData.basePositions = positions.slice()
  geometry.userData.segments = segments
  geometry.userData.widthSegments = widthSegments
  return geometry
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
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
  const smoothedPointer = useRef(new THREE.Vector2())
  const ribbonGeometry = useMemo(() => createRibbonGeometry(), [])
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
    material.iridescence = damp(material.iridescence, 0.5 + path.distort * 0.74 + (isTouching ? 0.15 : 0) + ambient * 0.09, 5, delta)
    material.roughness = damp(material.roughness, 0.16 + path.distort * 0.14, 5, delta)

    const position = ribbonGeometry.getAttribute('position') as THREE.BufferAttribute
    const basePositions = ribbonGeometry.userData.basePositions as Float32Array
    const segments = ribbonGeometry.userData.segments as number
    const widthSegments = ribbonGeometry.userData.widthSegments as number
    const columns = widthSegments + 1
    const positions = position.array as Float32Array
    const flow = elapsed * (isTouching ? 2.6 : 1.32)
    const amplitude = input.reducedMotion ? 0.035 : 0.22 + path.distort * 0.2
    for (let index = 0; index <= segments; index += 1) {
      const progress = index / segments
      const wave = Math.sin(progress * Math.PI * 5.4 - flow)
      const ripple = Math.cos(progress * Math.PI * 9.2 + flow * 0.72)
      const touchWarp = isTouching ? pointerX * (progress - 0.5) * 0.18 : 0

      for (let widthIndex = 0; widthIndex <= widthSegments; widthIndex += 1) {
        const lateral = THREE.MathUtils.lerp(-1, 1, widthIndex / widthSegments)
        const centerWeight = 1 - lateral * lateral
        const crossWave = Math.sin(progress * Math.PI * 7.5 - flow * 1.36 + lateral * 3.4)
        const offset = (index * columns + widthIndex) * 3
        positions[offset] = basePositions[offset] + ripple * amplitude * (0.16 + centerWeight * 0.17) + touchWarp
        positions[offset + 1] = basePositions[offset + 1] + wave * amplitude * (0.74 + centerWeight * 0.3) + pointerY * 0.05 * motionScale
        positions[offset + 2] = basePositions[offset + 2] + (ripple * 0.12 + crossWave * 0.17) * amplitude * (0.3 + centerWeight * 0.9) + wave * 0.08
      }
    }
    position.needsUpdate = true
    ribbonGeometry.computeVertexNormals()
  })
  return <group ref={groupRef} rotation={[0.1, 0.18, 0]}><mesh geometry={ribbonGeometry}><meshPhysicalMaterial ref={materialRef} clearcoat={1} clearcoatRoughness={0.08} color="#e6fdff" envMapIntensity={2.4} iridescence={0.7} iridescenceIOR={1.28} metalness={0.3} roughness={0.2} side={THREE.DoubleSide} thickness={0.22} transmission={0.12} /></mesh></group>
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
