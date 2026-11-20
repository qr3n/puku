"use client"

import { useId, type ReactNode } from "react"
import { Radio as Primitive } from "@base-ui/react/radio"
import { RadioGroup as GroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "@workspace/ui/lib/utils"

type RadioGroupProps<Value> = Omit<GroupPrimitive.Props<Value>, "className"> & {
  className?: string
}

export function RadioGroup<Value>({
  className,
  ...props
}: RadioGroupProps<Value>) {
  return (
    <GroupPrimitive
      {...props}
      className={cn("grid justify-items-start", className)}
    />
  )
}

type RadioGroupItemProps<Value> = Omit<
  Primitive.Root.Props<Value>,
  "children" | "className"
> & {
  className?: string
  label?: ReactNode
}

export function RadioGroupItem<Value>({
  className,
  label,
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  ...props
}: RadioGroupItemProps<Value>) {
  const labelId = useId()
  const control = (
    <Primitive.Root
      {...props}
      aria-label={ariaLabel}
      aria-labelledby={
        labelledBy ?? (label != null && !ariaLabel ? labelId : undefined)
      }
      className={cn("ui-radio", className)}
    >
      <span className="ui-radio-ring" aria-hidden="true">
        <Primitive.Indicator className="ui-radio-dot" keepMounted />
      </span>
    </Primitive.Root>
  )

  if (label == null) return control

  return (
    <label className="ui-radio-label">
      {control}
      <span id={labelId}>{label}</span>
    </label>
  )
}
