"use client"

import { useEffect, useRef, useState } from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { Shimmer } from "@workspace/ui/components/shimmer"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button relative inline-flex max-w-full shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-[1.25rem] border border-transparent bg-clip-padding text-center text-sm font-semibold [overflow-wrap:anywhere] whitespace-normal transition-[background-color,color,border-color,box-shadow,opacity,filter] duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 motion-reduce:transition-none dark:focus-visible:border-transparent dark:focus-visible:ring-2 dark:focus-visible:ring-white/40 dark:aria-invalid:border-error-accent dark:aria-invalid:ring-error-accent/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "text-button-primary-foreground [--shimmer-color:currentColor] before:bg-button-primary hover:before:bg-button-primary-hover",
        secondary:
          "text-secondary-foreground [--shimmer-color:currentColor] before:bg-button-secondary hover:before:bg-button-secondary-hover",
        tonal:
          "text-button-tertiary-foreground before:bg-button-tertiary hover:before:bg-button-tertiary-hover",
        ghost:
          "text-button-tertiary-foreground hover:before:bg-button-ghost-hover",
        destructive:
          "text-error-foreground-strong before:bg-error-surface hover:before:bg-error-field-hover",
      },
      size: {
        default:
          "min-h-12 min-w-32 gap-2 px-6 py-2 text-xl/tight has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 md:min-h-13 md:min-w-36 md:px-8",
        xs: "min-h-12 min-w-20 gap-1 rounded-[1rem] px-4 py-2 text-sm/tight in-data-[slot=button-group]:rounded-[0.875rem] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-12 min-w-24 gap-1.5 rounded-[1.125rem] px-5 py-2 text-base/tight in-data-[slot=button-group]:rounded-[0.875rem] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 md:min-h-13 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "min-h-15 min-w-40 gap-2 rounded-[1.5rem] px-8 py-2 text-2xl/tight has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 md:min-h-16 md:min-w-44 md:px-10",
        icon: "size-13 md:size-14",
        "icon-xs":
          "size-12 rounded-[1rem] in-data-[slot=button-group]:rounded-[0.875rem] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-12 rounded-[1.125rem] in-data-[slot=button-group]:rounded-[0.875rem] md:size-13 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg":
          "size-15 rounded-[1.5rem] md:size-16 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  children,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  focusableWhenDisabled,
  onPointerDown,
  onPointerLeave,
  onLostPointerCapture,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { loading?: boolean }) {
  const [pressed, setPressed] = useState(false)
  const gesture = useRef<{
    controller: AbortController
    pointerId: number
    releaseTimer?: ReturnType<typeof setTimeout>
  } | null>(null)
  const blocked = disabled || loading

  function resetPress() {
    const current = gesture.current
    if (!current) return
    current.controller.abort()
    clearTimeout(current.releaseTimer)
    gesture.current = null
    setPressed(false)
  }

  useEffect(
    () => () => {
      gesture.current?.controller.abort()
      clearTimeout(gesture.current?.releaseTimer)
    },
    []
  )

  useEffect(() => {
    if (blocked && gesture.current?.releaseTimer === undefined) resetPress()
  }, [blocked])

  return (
    <ButtonPrimitive
      {...props}
      data-slot="button"
      data-pressed={pressed || undefined}
      data-loading={loading || undefined}
      aria-busy={loading || props["aria-busy"]}
      disabled={blocked}
      focusableWhenDisabled={focusableWhenDisabled || (loading && !disabled)}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (
          !event.defaultPrevented &&
          !blocked &&
          event.isPrimary &&
          event.button === 0
        ) {
          resetPress()
          const controller = new AbortController()
          const pointerId = event.pointerId
          const current: NonNullable<typeof gesture.current> = {
            controller,
            pointerId,
          }
          const pressedAt = performance.now()
          gesture.current = current
          const options = { capture: true, signal: controller.signal }
          window.addEventListener(
            "pointerup",
            (release) => {
              if (
                release.pointerId !== pointerId ||
                current.releaseTimer !== undefined
              )
                return
              // Keep quick taps visible through the press transition.
              current.releaseTimer = setTimeout(
                resetPress,
                Math.max(0, 100 - (performance.now() - pressedAt))
              )
            },
            options
          )
          window.addEventListener(
            "pointercancel",
            (cancel) => {
              if (cancel.pointerId === pointerId) resetPress()
            },
            options
          )
          window.addEventListener("blur", resetPress, {
            signal: controller.signal,
          })
          setPressed(true)
        }
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        if (
          event.pointerId === gesture.current?.pointerId &&
          gesture.current.releaseTimer === undefined
        ) {
          resetPress()
        }
      }}
      onLostPointerCapture={(event) => {
        onLostPointerCapture?.(event)
        if (
          event.pointerId === gesture.current?.pointerId &&
          gesture.current.releaseTimer === undefined
        ) {
          resetPress()
        }
      }}
      className={cn(
        buttonVariants({ variant, size }),
        loading && "cursor-default brightness-90 disabled:opacity-100",
        className
      )}
    >
      <span data-button-content="">{children}</span>
      {loading && <Shimmer />}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
