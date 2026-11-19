import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const badgeVariants = cva(
  "inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-0.5 text-xs/5 font-semibold [overflow-wrap:anywhere] [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        success: "bg-success-surface text-success-foreground",
        warning: "bg-warning-surface text-warning-foreground",
        error: "bg-error-surface text-error-foreground-strong",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      {...props}
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
    />
  )
}
