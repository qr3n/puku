"use client"

import { useId, useState } from "react"
import { OTPField } from "@base-ui/react/otp-field"
import { cn } from "@workspace/ui/lib/utils"

type InputOTPProps = Omit<OTPField.Root.Props, "children" | "className"> & {
  label: string
  className?: string
}

function OTPDigit({ value }: { value: string }) {
  const [digits, setDigits] = useState({ value, previous: "", changed: false })
  if (digits.value !== value) {
    setDigits({ value, previous: digits.value, changed: true })
  }

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden forced-colors:hidden"
    >
      {digits.previous && (
        <span key={`out-${digits.previous}`} className="ui-otp-digit-out">
          {digits.previous}
        </span>
      )}
      {value && (
        <span
          key={`in-${value}`}
          className={digits.changed ? "ui-otp-digit-in" : "absolute"}
        >
          {value}
        </span>
      )}
    </span>
  )
}

export function InputOTP({
  label,
  id,
  length,
  className,
  ...props
}: InputOTPProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <>
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <OTPField.Root
        {...props}
        id={inputId}
        length={length}
        className={cn("flex w-full max-w-fit gap-2 sm:gap-3", className)}
      >
        {Array.from({ length }, (_, index) => (
          <OTPField.Input
            key={index}
            aria-label={
              index === 0 ? undefined : `${label} (${index + 1}/${length})`
            }
            aria-invalid={props["aria-invalid"]}
            aria-describedby={props["aria-describedby"]}
            render={(inputProps, state) => (
              <span
                data-filled={state.filled || undefined}
                data-invalid={
                  state.valid === false ||
                  props["aria-invalid"] === true ||
                  props["aria-invalid"] === "true" ||
                  undefined
                }
                className="relative h-16 w-16 min-w-0 flex-1 rounded-[1rem] bg-otp-slot text-2xl font-semibold text-foreground tabular-nums transition-colors focus-within:ring-2 focus-within:ring-otp-focus has-disabled:opacity-50 data-filled:bg-otp-slot-filled data-invalid:bg-error-field data-filled:data-invalid:bg-error-field motion-reduce:transition-none sm:h-20 sm:text-4xl dark:focus-within:bg-otp-slot-filled dark:focus-within:data-invalid:bg-error-field"
              >
                <input
                  {...inputProps}
                  className="peer forced-colors:caret-auto h-full w-full rounded-[inherit] bg-transparent text-center text-transparent caret-transparent outline-none forced-colors:text-[CanvasText]"
                />
                <OTPDigit value={state.value} />
                {!state.filled && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 hidden place-items-center peer-focus:grid forced-colors:peer-focus:hidden"
                  >
                    <span className="h-8 w-0.5 rounded-full bg-otp-caret motion-safe:animate-pulse sm:h-9" />
                  </span>
                )}
              </span>
            )}
          />
        ))}
      </OTPField.Root>
    </>
  )
}
