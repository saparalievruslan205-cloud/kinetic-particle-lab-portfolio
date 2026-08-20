'use client'

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from 'framer-motion'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export type MagneticButtonProps = Omit<
  HTMLMotionProps<'a'>,
  'children' | 'className' | 'href'
> & {
  href: string
  children: ReactNode
  className?: string
  'aria-label'?: string
}

export function MagneticButton({
  href,
  children,
  className,
  'aria-label': ariaLabel,
  onBlur,
  onFocus,
  onPointerCancel,
  onPointerDown,
  onPointerLeave,
  onPointerMove,
  onPointerUp,
  style,
  ...anchorProps
}: MagneticButtonProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { damping: 23, mass: 0.24, stiffness: 340 })
  const springY = useSpring(y, { damping: 23, mass: 0.24, stiffness: 340 })
  const prefersReducedMotion = Boolean(useReducedMotion())
  const finePointerRef = useRef(false)
  const [hasFinePointer, setHasFinePointer] = useState(false)
  const [pulseId, setPulseId] = useState(0)

  const resetMagnet = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const finePointerQuery = window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    )

    const syncPointer = () => {
      finePointerRef.current = finePointerQuery.matches
      setHasFinePointer(finePointerQuery.matches)

      if (!finePointerQuery.matches) {
        resetMagnet()
      }
    }

    syncPointer()
    finePointerQuery.addEventListener('change', syncPointer)

    return () => {
      finePointerQuery.removeEventListener('change', syncPointer)
    }
  }, [resetMagnet])

  useEffect(() => {
    if (prefersReducedMotion) resetMagnet()
  }, [prefersReducedMotion, resetMagnet])

  const handlePointerMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    onPointerMove?.(event)
    if (
      event.defaultPrevented ||
      event.pointerType !== 'mouse' ||
      !finePointerRef.current ||
      prefersReducedMotion
    ) {
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()
    const distanceFromCenterX = event.clientX - bounds.left - bounds.width / 2
    const distanceFromCenterY = event.clientY - bounds.top - bounds.height / 2

    x.set(distanceFromCenterX * 0.24)
    y.set(distanceFromCenterY * 0.3)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    onPointerDown?.(event)
    if (
      event.defaultPrevented ||
      prefersReducedMotion ||
      (event.pointerType === 'mouse' && finePointerRef.current)
    ) {
      return
    }

    setPulseId((currentId) => currentId + 1)
  }

  return (
    <motion.a
      {...anchorProps}
      aria-label={ariaLabel}
      className={twMerge(
        clsx(
          'group relative isolate inline-flex touch-manipulation items-center justify-center rounded-full border border-white/15 bg-white/[0.055] px-6 py-3 text-sm font-semibold tracking-[0.08em] text-white backdrop-blur-xl',
          'transition-[border-color,background-color,box-shadow] duration-300 hover:border-[#00f0ff]/55 hover:bg-[#00f0ff]/10 hover:shadow-[0_0_32px_rgba(0,240,255,0.2)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508]',
          className,
        ),
      )}
      data-cursor="magnetic"
      href={href}
      onBlur={(event) => {
        resetMagnet()
        onBlur?.(event)
      }}
      onFocus={(event) => {
        resetMagnet()
        onFocus?.(event)
      }}
      onPointerCancel={(event) => {
        resetMagnet()
        onPointerCancel?.(event)
      }}
      onPointerDown={handlePointerDown}
      onPointerLeave={(event) => {
        resetMagnet()
        onPointerLeave?.(event)
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        onPointerUp?.(event)
      }}
      style={{
        ...style,
        willChange:
          hasFinePointer && !prefersReducedMotion ? 'transform' : undefined,
        x: springX,
        y: springY,
      }}
      whileTap={
        !hasFinePointer && !prefersReducedMotion ? { scale: 0.97 } : undefined
      }
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>

      {pulseId > 0 ? (
        <motion.span
          key={pulseId}
          animate={{
            boxShadow: [
              '0 0 0 rgba(0, 240, 255, 0)',
              '0 0 28px rgba(0, 240, 255, 0.72)',
              '0 0 48px rgba(112, 0, 255, 0)',
            ],
            opacity: [0, 1, 0],
            scale: [0.96, 1.02, 1.1],
          }}
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] border border-[#00f0ff]/80"
          onAnimationComplete={() => {
            setPulseId((currentId) => (currentId === pulseId ? 0 : currentId))
          }}
          transition={{ duration: 0.62, ease: 'easeOut' }}
        />
      ) : null}
    </motion.a>
  )
}

export default MagneticButton
