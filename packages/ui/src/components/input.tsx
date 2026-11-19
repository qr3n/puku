"use client"

import { useState, type ComponentPropsWithRef } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  TextField,
  type TextFieldProps,
} from "@workspace/ui/components/text-field"
import { cn } from "@workspace/ui/lib/utils"

export type InputProps = Omit<ComponentPropsWithRef<"input">, "size"> &
  TextFieldProps

export function Input({
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
  type,
  disabled,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  const PasswordIcon = showPassword ? EyeOff : Eye

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
      rightAction={
        isPassword ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            lang="ru"
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            disabled={disabled}
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-2 my-auto size-10 rounded-xl text-muted-foreground after:bg-foreground/5 hover:text-foreground"
          >
            <PasswordIcon className="size-[1.125rem]" aria-hidden />
          </Button>
        ) : undefined
      }
    >
      {(fieldProps) => (
        <input
          {...props}
          {...fieldProps}
          type={isPassword && showPassword ? "text" : type}
          disabled={disabled}
          placeholder={placeholder ?? (label ? " " : undefined)}
          data-slot="input"
          className={cn("ui-text-field-control", className)}
        />
      )}
    </TextField>
  )
}
