import type { ComponentProps, CSSProperties } from "react"
import { cn } from "cn"
import { Skeleton } from "@workspace/ui/components/skeleton"

type MediaMask =
  | string
  | {
      path: string
      viewBox: readonly [x: number, y: number, width: number, height: number]
      fillRule?: "nonzero" | "evenodd"
    }

type MediaFrameProps = ComponentProps<"div"> & {
  mask?: MediaMask
  aspectRatio?: CSSProperties["aspectRatio"]
}

function maskImage(mask: MediaMask) {
  let url

  if (typeof mask === "string") {
    url = mask
  } else {
    const path = mask.path
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mask.viewBox.join(" ")}"><path d="${path}" fill-rule="${mask.fillRule ?? "nonzero"}"/></svg>`
    url = `data:image/svg+xml,${encodeURIComponent(svg)}`
  }

  return `url("${url.replace(/["\\\n\r\f]/g, (char) => `\\${char.charCodeAt(0).toString(16)} `)}")`
}

function MediaFrame({
  mask,
  aspectRatio,
  className,
  style,
  ...props
}: MediaFrameProps) {
  const viewBoxRatio =
    typeof mask === "object"
      ? `${mask.viewBox[2]} / ${mask.viewBox[3]}`
      : undefined

  return (
    <div
      data-slot="media-frame"
      {...props}
      className={cn("ui-media-frame", className)}
      style={{
        aspectRatio: aspectRatio ?? viewBoxRatio ?? "16 / 9",
        maskImage: mask ? maskImage(mask) : undefined,
        ...style,
      }}
    />
  )
}

function MediaSkeleton(props: Omit<MediaFrameProps, "children">) {
  return (
    <MediaFrame {...props} aria-hidden="true" data-slot="media-skeleton">
      <Skeleton className="absolute inset-0 rounded-none" />
    </MediaFrame>
  )
}

export { MediaFrame, MediaSkeleton, type MediaFrameProps, type MediaMask }
