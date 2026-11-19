"use client"

import {
  Fragment,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
} from "react"
import { cn } from "@workspace/ui/lib/utils"

export function OverlayHeader({
  className,
  ...props
}: ComponentProps<"header">) {
  return <header {...props} className={cn("ui-overlay-header", className)} />
}

type OverlayActionsProps = {
  /** First in a stack, last in a row. */
  primary: ReactElement
  secondary?: ReactElement
}

// Motion writes this visual-only property for every frame of a button press.
function layoutStyle(style: string | null) {
  return (
    style?.replace(/(^|;)\s*--button-press-scale:[^;]*;?/, "$1").trim() ?? ""
  )
}

export function OverlayActions({ primary, secondary }: OverlayActionsProps) {
  const group = useRef<HTMLDivElement>(null)
  const [row, setRow] = useState(false)

  useLayoutEffect(() => {
    const container = group.current
    if (!container) return
    const wide = window.matchMedia("(min-width: 40rem)")

    const updateLayout = () => {
      if (!wide.matches) {
        setRow(false)
        return
      }
      // Measure the real controls at their natural widths, including translated labels.
      container.dataset.measure = ""
      const fits = container.scrollWidth <= container.clientWidth
      delete container.dataset.measure
      setRow(fits)
    }

    updateLayout()
    const resize = new ResizeObserver(updateLayout)
    resize.observe(container)
    const labels = new MutationObserver((changes) => {
      const needsMeasurement = changes.some(
        (change) =>
          change.attributeName !== "style" ||
          layoutStyle(change.oldValue) !==
            layoutStyle((change.target as Element).getAttribute("style"))
      )
      if (needsMeasurement) updateLayout()
    })
    labels.observe(container, {
      childList: true,
      characterData: true,
      subtree: true,
      attributeOldValue: true,
      attributeFilter: ["class", "style", "hidden"],
    })
    wide.addEventListener("change", updateLayout)
    document.fonts.addEventListener("loadingdone", updateLayout)
    return () => {
      resize.disconnect()
      labels.disconnect()
      wide.removeEventListener("change", updateLayout)
      document.fonts.removeEventListener("loadingdone", updateLayout)
    }
  }, [])

  const main = <Fragment key="primary">{primary}</Fragment>
  const other = <Fragment key="secondary">{secondary}</Fragment>
  return (
    <div ref={group} className="ui-overlay-actions" data-row={row || undefined}>
      {row ? [other, main] : [main, other]}
    </div>
  )
}
