"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import type { AnimationItem, LottiePlayer as LottieWeb } from "lottie-web"
import { cn } from "cn"
import { Shimmer } from "@workspace/ui/components/shimmer"
import {
  prefersReducedMotion,
  useReducedMotion,
} from "@workspace/ui/hooks/use-reduced-motion"
import {
  getLottieAsset,
  type LottieAsset,
  type LottieName,
} from "@workspace/ui/lib/lottie"

type LottieSource =
  | { name: LottieName; asset?: never }
  | {
      name?: never
      asset: LottieAsset
    }

type LottiePresentation = {
  size?: CSSProperties["width"]
  className?: string
  label?: string
}

type LottieAppearance = LottieSource & LottiePresentation

type LottiePlayback = {
  autoplay?: boolean
  loop?: boolean
}

type LottieProps = LottieAppearance & LottiePlayback

type LottieState = "loading" | "ready" | "static"

function frameStyle(firstFrame: string, size?: CSSProperties["width"]) {
  return {
    "--lottie-first-frame": `url(${JSON.stringify(firstFrame)})`,
    "--lottie-size": typeof size === "number" ? `${size}px` : size,
  } as CSSProperties
}

function LottieSkeleton({
  name,
  asset,
  size,
  className,
  label,
}: LottieAppearance) {
  const { firstFrame } = asset ?? getLottieAsset(name)

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-slot="lottie-skeleton"
      className={cn("ui-lottie", className)}
      style={frameStyle(firstFrame, size)}
    >
      <span className="ui-lottie-mask">
        <Shimmer />
      </span>
    </span>
  )
}

function Lottie({ name, asset, loop = false, ...props }: LottieProps) {
  const { src, firstFrame } = asset ?? getLottieAsset(name)
  const reducedMotion = useReducedMotion()

  return (
    <LottiePlayer
      key={JSON.stringify([src, firstFrame, loop, reducedMotion])}
      src={src}
      firstFrame={firstFrame}
      loop={loop}
      reducedMotion={reducedMotion}
      {...props}
    />
  )
}

function LottiePlayer({
  src,
  firstFrame,
  size,
  className,
  label,
  autoplay = true,
  loop,
  reducedMotion,
}: LottieAsset &
  LottiePresentation &
  LottiePlayback & {
    reducedMotion: boolean
  }) {
  const container = useRef<HTMLSpanElement>(null)
  const player = useRef<AnimationItem | null>(null)
  const [state, setState] = useState<LottieState>("loading")

  useEffect(() => {
    if (reducedMotion || prefersReducedMotion()) return

    const controller = new AbortController()
    const { signal } = controller
    const target = container.current

    function showFallback() {
      if (signal.aborted) return
      setState("static")
      player.current?.destroy()
      player.current = null
    }

    async function load() {
      try {
        const [playerModule, animationData] = await Promise.all([
          import("lottie-web/build/player/lottie_svg.js"),
          fetch(src, { signal }).then((response) => {
            if (!response.ok) throw new Error(`Lottie HTTP ${response.status}`)
            return response.json()
          }),
        ])
        if (signal.aborted || !target) return

        // The SVG build exports the player directly from CommonJS.
        const lottie = playerModule.default as unknown as LottieWeb
        const animation = lottie.loadAnimation({
          container: target,
          renderer: "svg",
          rendererSettings: { className: "ui-lottie-svg" },
          animationData,
          autoplay: false,
          loop,
        })
        player.current = animation
        animation.addEventListener("DOMLoaded", () => {
          if (!signal.aborted) setState("ready")
        })
        animation.addEventListener("data_failed", showFallback)
        animation.addEventListener("error", showFallback)
      } catch {
        showFallback()
      }
    }

    void load()

    return () => {
      controller.abort()
      player.current?.destroy()
      player.current = null
    }
  }, [loop, reducedMotion, src])

  useEffect(() => {
    if (state !== "ready" || reducedMotion) return
    if (autoplay) player.current?.play()
    else player.current?.pause()
  }, [autoplay, reducedMotion, state])

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-slot="lottie"
      data-state={reducedMotion ? "static" : state}
      className={cn("ui-lottie", className)}
      style={frameStyle(firstFrame, size)}
    >
      <span className="ui-lottie-mask">
        <Shimmer />
      </span>
      <span className="ui-lottie-poster" />
      <span ref={container} className="ui-lottie-player" />
    </span>
  )
}

export { Lottie, LottieSkeleton, type LottieProps }
