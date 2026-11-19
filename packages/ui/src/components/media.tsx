"use client"

import {
  useCallback,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from "react"
import { cn } from "cn"
import {
  MediaFrame,
  type MediaFrameProps,
} from "@workspace/ui/components/media-frame"
import { Skeleton } from "@workspace/ui/components/skeleton"

type MediaProps = Pick<
  MediaFrameProps,
  "aspectRatio" | "mask" | "className"
> & {
  mediaClassName?: string
  fallback?: ReactNode
}

type MediaImageProps = ComponentProps<"img"> &
  MediaProps & {
    src: string
    alt: string
  }

type MediaVideoProps = ComponentProps<"video"> & MediaProps & { src: string }

type MediaState = "loading" | "ready" | "error"

function useMediaState<Element extends HTMLElement>(
  ref: Ref<Element> | undefined,
  readState: (element: Element) => MediaState
) {
  const [state, setState] = useState<MediaState>("loading")
  const attach = useCallback(
    (element: Element | null) => {
      // The browser can finish loading before React attaches event handlers.
      if (element) {
        const nextState = readState(element)
        if (nextState !== "loading") setState(nextState)
      }
      if (typeof ref === "function") return ref(element)
      if (ref) ref.current = element
    },
    [readState, ref]
  )

  return { state, setState, attach }
}

function imageState(image: HTMLImageElement): MediaState {
  if (!image.complete) return "loading"
  return image.naturalWidth > 0 ? "ready" : "error"
}

function videoState(video: HTMLVideoElement): MediaState {
  if (video.error) return "error"
  return video.readyState >= video.HAVE_CURRENT_DATA ? "ready" : "loading"
}

function mediaRatio(
  { aspectRatio, mask }: MediaProps,
  width: number | string | undefined,
  height: number | string | undefined,
  defaultRatio: string
) {
  if (aspectRatio != null) return aspectRatio
  if (typeof mask === "object") return undefined

  const w = Number(width)
  const h = Number(height)
  return w > 0 && h > 0 && Number.isFinite(w) && Number.isFinite(h)
    ? `${w} / ${h}`
    : defaultRatio
}

function MediaLayers({
  state,
  coverLoading,
  fallback,
  children,
}: {
  state: MediaState
  coverLoading?: boolean
  fallback?: ReactNode
  children: ReactNode
}) {
  return (
    <div
      className="absolute inset-0"
      data-slot="media"
      data-state={state}
      data-media-cover-loading={coverLoading || undefined}
    >
      {state !== "error" && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}
      {state === "error" && fallback != null ? (
        <div className="absolute inset-0" data-slot="media-fallback">
          {fallback}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

function MediaImage({
  aspectRatio,
  mask,
  className,
  width,
  height,
  ...props
}: MediaImageProps) {
  return (
    <MediaFrame
      aspectRatio={mediaRatio({ aspectRatio, mask }, width, height, "1 / 1")}
      mask={mask}
      className={className}
    >
      <ImageLayers
        key={JSON.stringify([
          props.src,
          props.srcSet,
          props.sizes,
          props.crossOrigin,
        ])}
        width={width}
        height={height}
        {...props}
      />
    </MediaFrame>
  )
}

function ImageLayers({
  ref,
  alt,
  mediaClassName,
  fallback,
  onLoad,
  onError,
  ...props
}: Omit<MediaImageProps, "mask" | "aspectRatio" | "className">) {
  const { state, setState, attach } = useMediaState(ref, imageState)

  return (
    <MediaLayers state={state} fallback={fallback}>
      <img
        {...props}
        ref={attach}
        alt={alt}
        className={cn("ui-media-element", mediaClassName)}
        onLoad={(event) => {
          setState("ready")
          onLoad?.(event)
        }}
        onError={(event) => {
          setState("error")
          onError?.(event)
        }}
      />
    </MediaLayers>
  )
}

function MediaVideo({
  aspectRatio,
  mask,
  className,
  width,
  height,
  ...props
}: MediaVideoProps) {
  return (
    <MediaFrame
      aspectRatio={mediaRatio({ aspectRatio, mask }, width, height, "16 / 9")}
      mask={mask}
      className={className}
    >
      <VideoLayers
        key={JSON.stringify([props.src, props.crossOrigin])}
        width={width}
        height={height}
        {...props}
      />
    </MediaFrame>
  )
}

function VideoLayers({
  ref,
  mediaClassName,
  fallback,
  preload = "auto",
  playsInline = true,
  onLoadedData,
  onCanPlay,
  onError,
  ...props
}: Omit<MediaVideoProps, "mask" | "aspectRatio" | "className">) {
  const { state, setState, attach } = useMediaState(ref, videoState)

  return (
    <MediaLayers
      state={state}
      coverLoading={preload === "auto" && !props.poster}
      fallback={fallback}
    >
      <video
        {...props}
        ref={attach}
        preload={preload}
        playsInline={playsInline}
        className={cn("ui-media-element", mediaClassName)}
        onLoadedData={(event) => {
          setState("ready")
          onLoadedData?.(event)
        }}
        onCanPlay={(event) => {
          setState("ready")
          onCanPlay?.(event)
        }}
        onError={(event) => {
          setState("error")
          onError?.(event)
        }}
      />
    </MediaLayers>
  )
}

export { MediaImage, MediaVideo, type MediaImageProps, type MediaVideoProps }
