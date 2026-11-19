"use client"

import type { ReactNode } from "react"
import { Switch as Primitive } from "@base-ui/react/switch"
import { cn } from "@workspace/ui/lib/utils"

type SwitchProps = Omit<Primitive.Root.Props, "children" | "className"> & {
  label?: ReactNode
  className?: string
}

export function Switch({ className, label, ...props }: SwitchProps) {
  const control = (
    <Primitive.Root {...props} className={cn("ui-switch", className)}>
      <span className="ui-switch-track" aria-hidden="true">
        <Primitive.Thumb className="ui-switch-thumb" />
      </span>
    </Primitive.Root>
  )

  if (label == null) return control

  return (
    <label className="ui-switch-label">
      {control}
      <span>{label}</span>
    </label>
  )
}
