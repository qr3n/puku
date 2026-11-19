"use client"

import type { ReactNode } from "react"
import { Checkbox as Primitive } from "@base-ui/react/checkbox"
import { cn } from "@workspace/ui/lib/utils"

export { CheckboxGroup } from "@base-ui/react/checkbox-group"

type CheckboxProps = Omit<Primitive.Root.Props, "children" | "className"> & {
  className?: string
  label?: ReactNode
}

export function Checkbox({ className, label, ...props }: CheckboxProps) {
  const control = (
    <Primitive.Root {...props} className={cn("ui-checkbox", className)}>
      <CheckboxMark />
    </Primitive.Root>
  )

  if (label == null) return control

  return (
    <label className="ui-checkbox-label">
      {control}
      <span>{label}</span>
    </label>
  )
}

/** The animated checkbox visual for controls that provide their own semantics. */
export function CheckboxMark() {
  return (
    <span className="ui-checkbox-box" aria-hidden="true">
      <svg
        className="ui-checkmark"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          className="ui-checkbox-check"
          d="m20 6-11 11-5-5"
          pathLength="1"
        />
        <path className="ui-checkbox-minus" d="M5 12h14" pathLength="1" />
      </svg>
    </span>
  )
}
