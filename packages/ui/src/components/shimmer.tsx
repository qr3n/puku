import { cn } from "cn"

function Shimmer({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-slot="shimmer"
      className={cn("ui-shimmer", className)}
    />
  )
}

export { Shimmer }
