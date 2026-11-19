"use client"

import { useSyncExternalStore, type CSSProperties, type Ref } from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { Shimmer } from "@workspace/ui/components/shimmer"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from "framer-motion"

const buttonVariants = cva(
  "group/button relative inline-flex max-w-full shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-[1.25rem] border border-transparent bg-clip-padding text-center text-sm font-semibold [overflow-wrap:anywhere] whitespace-normal transition-[background-color,color,border-color,box-shadow,opacity,filter] duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 motion-reduce:transition-none dark:focus-visible:border-transparent dark:focus-visible:ring-2 dark:focus-visible:ring-white/40 dark:aria-invalid:border-error-accent dark:aria-invalid:ring-error-accent/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "text-button-primary-foreground [--shimmer-color:currentColor] before:bg-button-primary hover:before:bg-button-primary-hover dark:[--shimmer-strength:14%]",
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

const REST_SCALE: TargetAndTransition = { "--button-press-scale": 1 }
const TAP_SCALE: TargetAndTransition = { "--button-press-scale": 0.96 }
const TAP_TRANSITION: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 22,
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)"

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function getReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches
}

function getServerReducedMotion() {
  return false
}

const MotionButton = motion.create(function MotionButton({
  buttonProps,
  loading,
  style,
  ref,
}: {
  buttonProps: ButtonPrimitive.Props
  loading: boolean
  style?: CSSProperties
  ref?: Ref<HTMLElement>
}) {
  const { style: buttonStyle, ...props } = buttonProps

  return (
    <ButtonPrimitive
      {...props}
      ref={ref}
      data-slot="button"
      data-loading={loading || undefined}
      style={(state) => ({
        ...(typeof buttonStyle === "function"
          ? buttonStyle(state)
          : buttonStyle),
        ...style,
      })}
    />
  )
})

function Button({
  className,
  children,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  focusableWhenDisabled,
  ref,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { loading?: boolean }) {
  const blocked = disabled || loading
  const reduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerReducedMotion
  )

  return (
    <MotionButton
      ref={ref}
      loading={loading}
      initial={false}
      animate={REST_SCALE}
      whileTap={blocked || reduceMotion ? undefined : TAP_SCALE}
      transition={TAP_TRANSITION}
      buttonProps={{
        ...props,
        "aria-busy": loading || props["aria-busy"],
        disabled: blocked,
        focusableWhenDisabled: focusableWhenDisabled || (loading && !disabled),
        className: cn(
          buttonVariants({ variant, size }),
          loading && "cursor-default brightness-90 disabled:opacity-100",
          className
        ),
        children: (
          <>
            <span data-button-content="">{children}</span>
            {loading && <Shimmer />}
          </>
        ),
      }}
    />
  )
}

export { Button, buttonVariants }
