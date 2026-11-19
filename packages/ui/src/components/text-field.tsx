"use client"

import { useId, useState, type AriaAttributes, type ReactNode } from "react"
import { TriangleAlert } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export type FieldTextProps = {
  label?: ReactNode
  error?: string
  helperText?: string
}

export type TextFieldProps = Omit<FieldTextProps, "label"> & {
  label?: string
  containerClassName?: string
  size?: "md" | "lg"
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

type ControlProps = {
  id: string
  "aria-describedby"?: string
  "aria-invalid"?: AriaAttributes["aria-invalid"]
}

export function TextField({
  id,
  label,
  error,
  helperText,
  containerClassName,
  size = "md",
  leftIcon,
  rightIcon,
  rightAction,
  multiline,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  children,
}: Omit<TextFieldProps, "label"> &
  FieldTextProps &
  Partial<ControlProps> & {
    rightAction?: ReactNode
    multiline?: boolean
    children: (props: ControlProps) => ReactNode
  }) {
  const autoId = useId()
  const hasLabel = label != null && typeof label !== "boolean" && label !== ""
  const fieldId = id ?? autoId
  const errorId = `${fieldId}-error`
  const helperId = `${fieldId}-desc`
  const description = error ? errorId : helperText ? helperId : undefined
  const [lastError, setLastError] = useState(error)

  // Keep the message available while the error row collapses.
  if (error && error !== lastError) {
    setLastError(error)
  }

  return (
    <div className={cn("w-full", containerClassName)}>
      <div
        className="ui-text-field"
        data-size={size}
        data-labeled={hasLabel ? "" : undefined}
        data-multiline={multiline ? "" : undefined}
        data-left-icon={leftIcon ? "" : undefined}
        data-right-icon={rightIcon && !rightAction ? "" : undefined}
        data-right-action={rightAction ? "" : undefined}
      >
        {children({
          id: fieldId,
          "aria-describedby":
            [describedBy, description].filter(Boolean).join(" ") || undefined,
          "aria-invalid": error ? true : invalid,
        })}
        {hasLabel && <label htmlFor={fieldId}>{label}</label>}
        {leftIcon && (
          <span className="ui-text-field-icon left-3" aria-hidden>
            {leftIcon}
          </span>
        )}
        {rightAction ??
          (rightIcon && (
            <span className="ui-text-field-icon right-3" aria-hidden>
              {rightIcon}
            </span>
          ))}
      </div>
      <div
        id={errorId}
        className="ui-text-field-error"
        data-visible={error ? "" : undefined}
        aria-hidden={!error}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            role={error ? "alert" : undefined}
            className="mt-1.5 flex items-start gap-1.5 px-1 text-xs font-medium text-error-foreground-muted"
          >
            <TriangleAlert
              className="size-4 shrink-0 text-error-accent"
              aria-hidden
            />
            <span>{error || lastError}</span>
          </div>
        </div>
      </div>
      {helperText && !error && (
        <p id={helperId} className="mt-1.5 px-1 text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  )
}
