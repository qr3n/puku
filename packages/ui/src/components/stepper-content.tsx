"use client"

import type { ReactNode } from "react"
import { SlidingContent } from "@workspace/ui/components/sliding-content"

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
  return (
    <SlidingContent
      index={currentStep}
      renderContent={(index) => children[index]}
      className={className}
    />
  )
}
