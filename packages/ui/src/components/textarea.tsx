"use client"

import type { ComponentPropsWithRef } from "react"
import {
  TextField,
  type TextFieldProps,
} from "@workspace/ui/components/text-field"
import { cn } from "@workspace/ui/lib/utils"

export type TextareaProps = ComponentPropsWithRef<"textarea"> & TextFieldProps

export function Textarea({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerClassName,
  size,
  id,
  className,
  placeholder,
  rows = 3,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: TextareaProps) {
  return (
    <TextField
      id={id}
      label={label}
      error={error}
      helperText={helperText}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      containerClassName={containerClassName}
      size={size}
      aria-describedby={describedBy}
      aria-invalid={invalid}
      multiline
    >
      {(fieldProps) => (
        <textarea
          {...props}
          {...fieldProps}
          rows={rows}
          placeholder={placeholder ?? (label ? " " : undefined)}
          data-slot="textarea"
          className={cn("ui-text-field-control resize-none", className)}
        />
      )}
    </TextField>
  )
}
