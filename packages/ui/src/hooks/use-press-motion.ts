"use client"

import { useReducedMotion } from "@workspace/ui/hooks/use-reduced-motion"
import type { MotionProps } from "framer-motion"

const pressMotion = {
  initial: false,
  animate: { "--press-scale": 1 },
  transition: { type: "spring", stiffness: 400, damping: 22 },
} satisfies MotionProps

export function usePressMotion(disabled?: boolean, pressedScale = 0.96) {
  const reduceMotion = useReducedMotion()

  return {
    ...pressMotion,
    whileTap:
      disabled || reduceMotion ? undefined : { "--press-scale": pressedScale },
  }
}
