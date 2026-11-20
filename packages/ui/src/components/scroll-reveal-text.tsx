"use client"

import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  type MotionStyle,
  type MotionValue,
  type UseScrollOptions,
} from "framer-motion"
import {
  useEffect,
  useMemo,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react"
import { useReducedMotion } from "@workspace/ui/hooks/use-reduced-motion"
import {
  useRevealInView,
  type RevealViewportOptions,
} from "@workspace/ui/hooks/use-reveal-in-view"
import { splitGraphemes } from "@workspace/ui/lib/split-graphemes"
import { cn } from "@workspace/ui/lib/utils"

export type ScrollRevealTextProps = Omit<
  ComponentPropsWithoutRef<"p">,
  "children"
> & {
  text: string
  /** Follow the scroll position or play on viewport entry. */
  trigger?: "scroll" | "inView"
  viewport?: RevealViewportOptions
  /** Duration of the viewport-triggered reveal in milliseconds. */
  duration?: number
  /** Fraction of the scroll range over which each character changes color. */
  feather?: number
  /** Intersections that define the range when following the scroll position. */
  offset?: UseScrollOptions["offset"]
}

type RevealProgressProps = {
  target: RefObject<HTMLParagraphElement | null>
  feather: number
  children: ReactNode
}

function RevealProgress({
  progress,
  feather,
  children,
}: Omit<RevealProgressProps, "target"> & { progress: MotionValue<number> }) {
  return (
    <motion.span
      aria-hidden
      style={
        {
          "--ui-scroll-reveal-progress": progress,
          "--ui-scroll-reveal-feather": feather,
        } as MotionStyle
      }
    >
      {children}
    </motion.span>
  )
}

function ScrollProgress({
  target,
  offset,
  ...props
}: RevealProgressProps & { offset: UseScrollOptions["offset"] }) {
  const { scrollYProgress } = useScroll({ target, offset })
  return <RevealProgress progress={scrollYProgress} {...props} />
}

function InViewProgress({
  target,
  viewport,
  duration,
  ...props
}: RevealProgressProps & {
  viewport?: RevealViewportOptions
  duration: number
}) {
  const inView = useRevealInView(target, viewport)
  const progress = useMotionValue(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!inView || reducedMotion || duration <= 0) {
      progress.set(inView ? 1 : 0)
      return
    }

    if (progress.get() === 1) return
    const animation = animate(progress, 1, {
      duration: duration / 1000,
      ease: "linear",
    })

    return () => animation.stop()
  }, [duration, inView, progress, reducedMotion])

  return <RevealProgress progress={progress} {...props} />
}

export function ScrollRevealText({
  text,
  trigger = "scroll",
  viewport,
  duration = 900,
  feather = 0.12,
  offset = ["start 85%", "end 35%"],
  className,
  ...props
}: ScrollRevealTextProps) {
  const target = useRef<HTMLParagraphElement>(null)
  const { characters, lastIndex } = useMemo(() => {
    let index = 0
    const characters = splitGraphemes(text).map((character) => ({
      character,
      index: /^\s/u.test(character) ? null : index++,
    }))

    return { characters, lastIndex: Math.max(index - 1, 1) }
  }, [text])
  const blend = Math.min(Math.max(feather, 0.001), 1)
  const characterSpans = characters.map(({ character, index }, position) =>
    index === null ? (
      character
    ) : (
      <span
        key={position}
        className="ui-scroll-reveal-character"
        style={
          {
            "--ui-scroll-reveal-start": (index / lastIndex) * (1 - blend),
          } as CSSProperties
        }
      >
        {character}
      </span>
    )
  )

  return (
    <p
      ref={target}
      className={cn("wrap-break-word whitespace-pre-wrap", className)}
      {...props}
    >
      <span className="sr-only select-none">{text}</span>
      {trigger === "inView" ? (
        <InViewProgress
          target={target}
          viewport={viewport}
          duration={duration}
          feather={blend}
        >
          {characterSpans}
        </InViewProgress>
      ) : (
        <ScrollProgress target={target} offset={offset} feather={blend}>
          {characterSpans}
        </ScrollProgress>
      )}
    </p>
  )
}
