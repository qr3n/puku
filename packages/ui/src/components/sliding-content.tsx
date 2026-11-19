"use client"

import { useEffect, useState, type ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

type SlidingContentProps = {
  index: number
  renderContent: (index: number) => ReactNode
  className?: string
}

export function SlidingContent({
  index,
  renderContent,
  className,
}: SlidingContentProps) {
  const [transition, setTransition] = useState<{
    current: number
    previous?: number
  }>({ current: index })
  if (transition.current !== index) {
    setTransition({ current: index, previous: transition.current })
  }

  const previous = transition.previous
  useEffect(() => {
    if (previous === undefined) return
    // Also remove the outgoing panel when animations are disabled.
    const timer = setTimeout(() => setTransition({ current: index }), 380)
    return () => clearTimeout(timer)
  }, [index, previous])

  return (
    <div
      className={cn("grid min-w-0 overflow-hidden", className)}
      data-step-direction={
        previous !== undefined && index < previous ? "back" : "forward"
      }
    >
      {previous !== undefined && (
        <div
          key={previous}
          aria-hidden
          inert
          className="ui-step-exit col-start-1 row-start-1 min-w-0 motion-reduce:hidden"
        >
          {renderContent(previous)}
        </div>
      )}
      <div
        key={index}
        className={cn(
          "col-start-1 row-start-1 min-w-0",
          previous !== undefined && "ui-step-enter"
        )}
      >
        {renderContent(index)}
      </div>
    </div>
  )
}
