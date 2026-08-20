'use client'

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const INTERACTIVE_SELECTOR = 'button, a, [data-cursor]'
const DESKTOP_CURSOR_STYLES = `
  @media (hover: hover) and (pointer: fine) {
    html,
    body,
    button,
    a,
    [data-cursor] {
      cursor: none !important;
    }
  }
`

type PointerMode = 'coarse' | 'fine' | 'unknown'

interface TouchRipple {
  id: number
  x: number
  y: number
}

export function CustomCursor() {
  const pointerX = useMotionValue(-120)
  const pointerY = useMotionValue(-120)
  const auraX = useSpring(pointerX, {
    damping: 32,
    mass: 0.22,
    stiffness: 430,
  })
  const auraY = useSpring(pointerY, {
    damping: 32,
    mass: 0.22,
    stiffness: 430,
  })
  const prefersReducedMotion = Boolean(useReducedMotion())
  const [pointerMode, setPointerMode] = useState<PointerMode>('unknown')
  const [isDesktopVisible, setDesktopVisible] = useState(false)
  const [isInteractive, setInteractive] = useState(false)
  const [isTouching, setTouching] = useState(false)
  const [ripples, setRipples] = useState<TouchRipple[]>([])
  const interactiveRef = useRef(false)
  const activePointerRef = useRef<number | null>(null)
  const nextRippleIdRef = useRef(0)
  const rippleTimersRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (typeof window === 'undefined') return

    const coarsePointerQuery = window.matchMedia('(pointer: coarse)')
    const finePointerQuery = window.matchMedia('(pointer: fine)')

    const syncPointerMode = () => {
      if (coarsePointerQuery.matches) {
        setPointerMode('coarse')
      } else if (finePointerQuery.matches) {
        setPointerMode('fine')
      } else {
        setPointerMode('unknown')
      }
    }

    const setInteractiveTarget = (nextValue: boolean) => {
      if (interactiveRef.current === nextValue) return
      interactiveRef.current = nextValue
      setInteractive(nextValue)
    }

    const updatePosition = (event: PointerEvent) => {
      pointerX.set(event.clientX)
      pointerY.set(event.clientY)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        if (activePointerRef.current === event.pointerId) {
          updatePosition(event)
        }
        return
      }

      if (coarsePointerQuery.matches) return

      updatePosition(event)
      setDesktopVisible(true)

      const target =
        event.target instanceof Element
          ? event.target.closest(INTERACTIVE_SELECTOR)
          : null
      setInteractiveTarget(Boolean(target))
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || !event.isPrimary) return

      activePointerRef.current = event.pointerId
      updatePosition(event)
      setDesktopVisible(false)
      setTouching(true)

      const rippleId = ++nextRippleIdRef.current
      setRipples((currentRipples) => [
        ...currentRipples.slice(-5),
        { id: rippleId, x: event.clientX, y: event.clientY },
      ])

      const timer = window.setTimeout(() => {
        setRipples((currentRipples) =>
          currentRipples.filter((ripple) => ripple.id !== rippleId),
        )
        rippleTimersRef.current.delete(timer)
      }, 760)
      rippleTimersRef.current.add(timer)
    }

    const finishTouch = (event?: PointerEvent) => {
      if (
        event &&
        activePointerRef.current !== null &&
        event.pointerId !== activePointerRef.current
      ) {
        return
      }

      activePointerRef.current = null
      setTouching(false)
    }

    const handlePointerOut = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.relatedTarget === null) {
        setDesktopVisible(false)
        setInteractiveTarget(false)
      }
    }

    const handleWindowBlur = () => {
      setDesktopVisible(false)
      setInteractiveTarget(false)
      finishTouch()
    }

    syncPointerMode()
    coarsePointerQuery.addEventListener('change', syncPointerMode)
    finePointerQuery.addEventListener('change', syncPointerMode)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointerup', finishTouch, { passive: true })
    window.addEventListener('pointercancel', finishTouch, { passive: true })
    window.addEventListener('pointerout', handlePointerOut, { passive: true })
    window.addEventListener('blur', handleWindowBlur)

    const rippleTimers = rippleTimersRef.current

    return () => {
      coarsePointerQuery.removeEventListener('change', syncPointerMode)
      finePointerQuery.removeEventListener('change', syncPointerMode)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', finishTouch)
      window.removeEventListener('pointercancel', finishTouch)
      window.removeEventListener('pointerout', handlePointerOut)
      window.removeEventListener('blur', handleWindowBlur)
      rippleTimers.forEach((timer) => window.clearTimeout(timer))
      rippleTimers.clear()
    }
  }, [pointerX, pointerY])

  const showDesktopCursor = pointerMode === 'fine' && !isTouching
  const showTouchAura = pointerMode === 'coarse' || isTouching

  return (
    <>
      <style>{DESKTOP_CURSOR_STYLES}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9999] select-none"
      >
        <motion.div
          animate={{
            backgroundColor: isInteractive
              ? 'rgba(0, 240, 255, 0.16)'
              : 'rgba(0, 240, 255, 0.035)',
            opacity: showDesktopCursor && isDesktopVisible ? 1 : 0,
            scale: isInteractive ? 1.55 : 1,
          }}
          className="absolute left-0 top-0 h-12 w-12 rounded-full border border-[#00f0ff]/70 mix-blend-difference"
          style={{
            boxShadow:
              '0 0 18px rgba(0, 240, 255, 0.72), 0 0 48px rgba(0, 240, 255, 0.3)',
            marginLeft: -24,
            marginTop: -24,
            x: auraX,
            y: auraY,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { damping: 25, stiffness: 360, type: 'spring' }
          }
        />

        <motion.div
          animate={{
            opacity: showDesktopCursor && isDesktopVisible ? 1 : 0,
            scale: isInteractive ? 0.55 : 1,
          }}
          className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-[#00f0ff] mix-blend-difference"
          style={{
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.95)',
            marginLeft: -3,
            marginTop: -3,
            x: pointerX,
            y: pointerY,
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
        />

        <motion.div
          animate={{
            opacity: showTouchAura && isTouching ? 0.62 : 0,
            scale: showTouchAura && isTouching ? 1 : 0.72,
          }}
          className="absolute left-0 top-0 h-[4.5rem] w-[4.5rem] rounded-full border border-[#00f0ff]/45 bg-[#00f0ff]/10"
          style={{
            boxShadow:
              '0 0 34px rgba(0, 240, 255, 0.48), inset 0 0 24px rgba(112, 0, 255, 0.2)',
            marginLeft: -36,
            marginTop: -36,
            x: auraX,
            y: auraY,
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
        />

        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            animate={{
              opacity: 0,
              scale: prefersReducedMotion ? 1.25 : 4,
            }}
            className="absolute h-10 w-10 rounded-full border border-[#00f0ff]/80"
            initial={{ opacity: 0.9, scale: 0.35 }}
            style={{
              boxShadow:
                '0 0 18px rgba(0, 240, 255, 0.72), inset 0 0 14px rgba(112, 0, 255, 0.42)',
              left: ripple.x,
              marginLeft: -20,
              marginTop: -20,
              top: ripple.y,
            }}
            transition={{
              duration: prefersReducedMotion ? 0.18 : 0.72,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </>
  )
}

export default CustomCursor
