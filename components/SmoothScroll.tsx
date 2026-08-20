'use client'

import type { ReactNode } from 'react'

export interface SmoothScrollProps {
  children: ReactNode
}

/** Uses browser-native scrolling to keep the animation budget for the page itself. */
export function SmoothScroll({ children }: SmoothScrollProps) {
  return <>{children}</>
}

export default SmoothScroll
