import { Shimmer } from "@workspace/ui/components/shimmer"
import { cn } from "cn"

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn("relative rounded-md bg-muted", className)}
    >
      <Shimmer />
    </div>
  )
}

export { Skeleton }
