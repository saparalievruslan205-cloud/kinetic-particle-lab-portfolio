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

    const canUseSmoothScroll = () => {
      const navigatorWithHints = navigator as Navigator & {
        connection?: { effectiveType?: string; saveData?: boolean }
        deviceMemory?: number
      }
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      const lowMemory = (navigatorWithHints.deviceMemory ?? 8) <= 4
      const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4
      const connection = navigatorWithHints.connection
      const slowNetwork = connection?.saveData || /2g|3g/.test(connection?.effectiveType ?? '')

      return finePointer && !reducedMotionQuery.matches && !lowMemory && !lowCpu && !slowNetwork
    }

    const start = () => {
      if (lenis || !canUseSmoothScroll()) return

      lenis = new Lenis({
        anchors: true,
        gestureOrientation: 'vertical',
        lerp: 0.09,
        orientation: 'vertical',
        overscroll: true,
        respectReducedMotion: true,
        smoothWheel: true,
        wheelMultiplier: 0.9,
      })

      animationFrame = window.requestAnimationFrame(frame)
    }

    const handleMotionPreference = () => {
      if (!canUseSmoothScroll()) {
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
