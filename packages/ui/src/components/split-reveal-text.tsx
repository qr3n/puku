"use client"

import { Fragment, useMemo, useRef, type ComponentPropsWithoutRef } from "react"
import {
  useRevealInView,
  type RevealViewportOptions,
} from "@workspace/ui/hooks/use-reveal-in-view"
import { splitGraphemes } from "@workspace/ui/lib/split-graphemes"
import { cn } from "@workspace/ui/lib/utils"

export type SplitRevealTextProps = Omit<
  ComponentPropsWithoutRef<"span">,
  "children"
> & {
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  text: string
  /** Start when the text enters the viewport or as soon as it mounts. */
  trigger?: "inView" | "mount"
  viewport?: RevealViewportOptions
  /** Time in milliseconds for each character to rise into view. */
  duration?: number
  /** Delay in milliseconds between characters. */
  stagger?: number
}

export function SplitRevealText({
  as: Tag = "span",
  text,
  trigger = "inView",
  viewport,
  duration = 600,
  stagger = 28,
  className,
  ...props
}: SplitRevealTextProps) {
  const target = useRef<HTMLSpanElement>(null)
  const inView = useRevealInView(target, viewport, trigger === "inView")
  const revealed = trigger === "mount" || inView
  const parts = useMemo(() => {
    let index = 0

    return text
      .split(/(\s+)/u)
      .filter(Boolean)
      .map((part) => ({
        part,
        characters: /^\s/u.test(part)
          ? null
          : splitGraphemes(part).map((character) => ({
              character,
              index: index++,
            })),
      }))
  }, [text])

  return (
    <Tag className={cn("whitespace-pre-wrap", className)} {...props}>
      <span className="sr-only select-none">{text}</span>
      <span ref={target} aria-hidden data-split-revealed={revealed}>
        {parts.map(({ part, characters }, partIndex) => (
          <Fragment key={partIndex}>
            {characters ? (
              <span className="ui-split-reveal-word">
                {characters.map(({ character, index }) => (
                  <span className="ui-split-reveal-mask" key={index}>
                    <span
                      className="ui-split-reveal-character"
                      style={{
                        animationDelay: `${index * stagger}ms`,
                        animationDuration: `${duration}ms`,
                      }}
                    >
                      {character}
                    </span>
                  </span>
                ))}
              </span>
            ) : (
              part
            )}
          </Fragment>
        ))}
      </span>
    </Tag>
  )
}
