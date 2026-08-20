'use client'

import Lenis from 'lenis'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

export interface SmoothScrollProps {
  children: ReactNode
}

/**
 * Adds inertial wheel and touch scrolling while preserving native scrolling for
 * people who prefer reduced motion.
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    let lenis: Lenis | null = null
    let animationFrame: number | null = null

    const stop = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
        animationFrame = null
      }

      lenis?.destroy()
      lenis = null
    }

    const frame = (time: number) => {
      lenis?.raf(time)
      animationFrame = window.requestAnimationFrame(frame)
    }

    const start = () => {
      if (lenis || reducedMotionQuery.matches) return

      lenis = new Lenis({
        anchors: true,
        gestureOrientation: 'vertical',
        lerp: 0.09,
        orientation: 'vertical',
        overscroll: true,
        respectReducedMotion: true,
        smoothWheel: true,
        syncTouch: true,
        syncTouchLerp: 0.075,
        touchInertiaExponent: 1.75,
        touchMultiplier: 1.05,
        wheelMultiplier: 0.9,
      })

      animationFrame = window.requestAnimationFrame(frame)
    }

    const handleMotionPreference = () => {
      if (reducedMotionQuery.matches) {
        stop()
      } else {
        start()
      }
    }

    handleMotionPreference()
    reducedMotionQuery.addEventListener('change', handleMotionPreference)

    return () => {
      reducedMotionQuery.removeEventListener('change', handleMotionPreference)
      stop()
    }
  }, [])

  return <>{children}</>
}

export default SmoothScroll
