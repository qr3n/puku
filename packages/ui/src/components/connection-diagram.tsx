"use client"

import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react"
import {
  getConnectionPath,
  type ConnectionBox,
  type ConnectionLayout,
  type ConnectionRoute,
} from "@workspace/ui/lib/connection-path"
import { cn } from "@workspace/ui/lib/utils"

export type {
  ConnectionAnchor,
  ConnectionShape,
  ConnectionSide,
  ConnectionStep,
  ConnectionWaypoint,
} from "@workspace/ui/lib/connection-path"

export type DiagramConnection = ConnectionRoute & {
  id?: string
  className?: string
  stroke?: string
  strokeWidth?: number
  strokeDasharray?: string
}

export type ConnectionDiagramProps = ComponentPropsWithoutRef<"div"> & {
  connections: readonly DiagramConnection[]
}

const diagramSelector = "[data-connection-diagram]"
const nodeSelector = "[data-connection-node]"

function sameLayout(previous: ConnectionLayout | null, next: ConnectionLayout) {
  if (
    !previous ||
    previous.width !== next.width ||
    previous.height !== next.height ||
    previous.nodes.size !== next.nodes.size
  )
    return false

  for (const [id, box] of next.nodes) {
    const old = previous.nodes.get(id)
    if (
      !old ||
      box.left !== old.left ||
      box.top !== old.top ||
      box.right !== old.right ||
      box.bottom !== old.bottom
    )
      return false
  }

  return true
}

export function ConnectionDiagram({
  connections,
  children,
  className,
  ...props
}: ConnectionDiagramProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [layout, setLayout] = useState<ConnectionLayout | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const svg = svgRef.current
    if (!root || !svg) return

    let frame = 0
    let observed = new Set<Element>()

    function schedule() {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        measure()
      })
    }

    const resize = new ResizeObserver(schedule)

    function measure() {
      if (!root || !svg) return

      const nextObserved = new Set<Element>([root])
      const nodes = new Map<string, ConnectionBox>()
      // Measure in SVG units so scaled diagrams keep their lines attached.
      const diagramMatrix = svg.getScreenCTM()?.inverse()

      for (const element of root.querySelectorAll(nodeSelector)) {
        if (element.closest(diagramSelector) !== root) continue
        for (
          let parent: Element | null = element;
          parent && parent !== root;
          parent = parent.parentElement
        ) {
          nextObserved.add(parent)
        }

        const id = element.getAttribute("data-connection-node")
        if (
          !id ||
          nodes.has(id) ||
          !diagramMatrix ||
          !element.getClientRects().length ||
          getComputedStyle(element).visibility !== "visible"
        )
          continue

        const box = element.getBoundingClientRect()
        const topLeft = new DOMPoint(box.left, box.top).matrixTransform(
          diagramMatrix
        )
        const bottomRight = new DOMPoint(box.right, box.bottom).matrixTransform(
          diagramMatrix
        )
        if (
          ![topLeft.x, topLeft.y, bottomRight.x, bottomRight.y].every(
            Number.isFinite
          )
        )
          continue

        nodes.set(id, {
          left: Math.min(topLeft.x, bottomRight.x),
          top: Math.min(topLeft.y, bottomRight.y),
          right: Math.max(topLeft.x, bottomRight.x),
          bottom: Math.max(topLeft.y, bottomRight.y),
        })
      }

      for (const element of observed) {
        if (!nextObserved.has(element)) resize.unobserve(element)
      }
      for (const element of nextObserved) {
        if (!observed.has(element))
          resize.observe(element, { box: "border-box" })
      }
      observed = nextObserved

      const next = { width: svg.clientWidth, height: svg.clientHeight, nodes }
      setLayout((previous) => (sameLayout(previous, next) ? previous : next))
    }

    const mutations = new MutationObserver((records) => {
      if (records.some(({ target }) => !svg.contains(target))) schedule()
    })
    mutations.observe(root, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    })
    root.addEventListener("scroll", schedule, true)
    root.addEventListener("load", schedule, true)
    window.addEventListener("resize", schedule)
    document.fonts.addEventListener("loadingdone", schedule)
    measure()

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      mutations.disconnect()
      root.removeEventListener("scroll", schedule, true)
      root.removeEventListener("load", schedule, true)
      window.removeEventListener("resize", schedule)
      document.fonts.removeEventListener("loadingdone", schedule)
    }
  }, [])

  return (
    <div
      {...props}
      ref={rootRef}
      data-connection-diagram=""
      className={cn("ui-connection-diagram", className)}
    >
      <svg
        ref={svgRef}
        className="ui-connection-diagram-lines"
        aria-hidden="true"
        focusable="false"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {layout &&
          connections.map((connection, index) => {
            const path = getConnectionPath(layout, connection)
            return path ? (
              <path
                key={connection.id ?? index}
                data-connection-id={connection.id}
                d={path}
                className={connection.className}
                stroke={connection.stroke}
                strokeWidth={connection.strokeWidth}
                strokeDasharray={connection.strokeDasharray}
                vectorEffect="non-scaling-stroke"
              />
            ) : null
          })}
      </svg>
      {children}
    </div>
  )
}
