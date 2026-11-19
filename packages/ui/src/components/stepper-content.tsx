"use client"

import { useEffect, useState, type ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

type StepperContentProps = {
  currentStep: number
  children: readonly ReactNode[]
  className?: string
}

export function StepperContent({
  currentStep,
  children,
  className,
}: StepperContentProps) {
  const [transition, setTransition] = useState<{
    current: number
    previous?: number
  }>({ current: currentStep })
  if (transition.current !== currentStep) {
    setTransition({ current: currentStep, previous: transition.current })
  }

  const previous = transition.previous
  useEffect(() => {
    if (previous === undefined) return
    // Also remove the outgoing screen when animations are disabled.
    const timer = setTimeout(() => setTransition({ current: currentStep }), 380)
    return () => clearTimeout(timer)
  }, [currentStep, previous])

  return (
    <div
      className={cn("grid min-w-0 overflow-hidden", className)}
      data-step-direction={
        previous !== undefined && currentStep < previous ? "back" : "forward"
      }
    >
      {previous !== undefined && (
        <div
          key={previous}
          aria-hidden
          inert
          className="ui-step-exit col-start-1 row-start-1 min-w-0 motion-reduce:hidden"
        >
          {children[previous]}
        </div>
      )}
      <div
        key={currentStep}
        className={cn(
          "col-start-1 row-start-1 min-w-0",
          previous !== undefined && "ui-step-enter"
        )}
      >
        {children[currentStep]}
      </div>
    </div>
  )
}
