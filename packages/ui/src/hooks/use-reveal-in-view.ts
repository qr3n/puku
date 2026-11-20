"use client"

import { useEffect, useState, type RefObject } from "react"

export type RevealViewportOptions = {
  /** Inset in pixels from the bottom of the viewport. Defaults to 0. */
  offset?: number
  /** Keep the text revealed after its first entrance. Defaults to true. */
  once?: boolean
}

export function useRevealInView(
  target: RefObject<Element | null>,
  { offset = 0, once = true }: RevealViewportOptions = {},
  enabled = true
) {
  const [visibility, setVisibility] = useState({
    inView: false,
    hasEntered: false,
  })
  const revealed = once && visibility.hasEntered
  const inset = Number.isFinite(offset) ? Math.max(0, offset) : 0

  useEffect(() => {
    const element = target.current
    if (!enabled || !element || revealed) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        const inView = entry.isIntersecting
        setVisibility((previous) => ({
          inView,
          hasEntered: previous.hasEntered || inView,
        }))
        if (once && inView) observer.disconnect()
      },
      { rootMargin: `0px 0px ${-inset}px 0px` }
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [enabled, inset, once, revealed, target])

  return revealed || visibility.inView
}
