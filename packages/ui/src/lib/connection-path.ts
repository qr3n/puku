export type ConnectionSide =
  "auto" | "top" | "right" | "bottom" | "left" | "center"
export type ConnectionShape = "stepped" | "curve"

export type ConnectionStep = {
  /** Length in pixels of the first horizontal segment. Omit to size it to the route. */
  lead?: number
  /** Vertical position of the step, from the horizontal end (0) to the vertical end (1). Defaults to 0.56. */
  position?: number
}

export type ConnectionAnchor =
  | string
  | {
      node: string
      side?: ConnectionSide
      /** Position along the chosen side, from 0 to 1. Defaults to 0.5. */
      offset?: number
    }

/** A relative position within the diagram, or an anchor on a diagram node. */
export type ConnectionWaypoint = ConnectionAnchor | { x: number; y: number }

type Point = { x: number; y: number }
export type ConnectionBox = {
  left: number
  top: number
  right: number
  bottom: number
}
export type ConnectionLayout = {
  width: number
  height: number
  nodes: ReadonlyMap<string, ConnectionBox>
}

type Port = { point: Point; direction?: Point }

const directions = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
}

function move(point: Point, direction: Point, distance: number): Point {
  return {
    x: point.x + direction.x * distance,
    y: point.y + direction.y * distance,
  }
}

function delta(from: Point, to: Point): Point {
  return { x: to.x - from.x, y: to.y - from.y }
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function dot(a: Point, b: Point) {
  return a.x * b.x + a.y * b.y
}

function unit(from: Point, to: Point): Point {
  const length = distance(from, to) || 1
  return { x: (to.x - from.x) / length, y: (to.y - from.y) / length }
}

function svgPoint({ x, y }: Point) {
  return `${Number(x.toFixed(2))} ${Number(y.toFixed(2))}`
}

function center(box: ConnectionBox): Point {
  return { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 }
}

function resolveAnchor(
  anchor: ConnectionAnchor,
  box: ConnectionBox,
  toward: Point
): Port {
  const midpoint = center(box)
  const { x, y } = delta(midpoint, toward)
  const options = typeof anchor === "string" ? undefined : anchor
  const inferredSide =
    Math.abs(x) > Math.abs(y)
      ? x < 0
        ? "left"
        : "right"
      : y < 0
        ? "top"
        : "bottom"
  const side =
    options?.side && options.side !== "auto" ? options.side : inferredSide
  if (side === "center") return { point: midpoint }

  const offset = Math.min(1, Math.max(0, options?.offset ?? 0.5))
  const horizontal = side === "top" || side === "bottom"
  return {
    point: {
      x: horizontal ? box.left + (box.right - box.left) * offset : box[side],
      y: horizontal ? box[side] : box.top + (box.bottom - box.top) * offset,
    },
    direction: directions[side],
  }
}

function compact(points: readonly Point[]) {
  const result: Point[] = []
  for (const point of points) {
    const last = result.at(-1)
    if (last && distance(last, point) < 0.001) continue
    const previous = result.at(-2)
    if (previous && last) {
      const incoming = delta(previous, last)
      const outgoing = delta(last, point)
      if (
        incoming.x * outgoing.y === incoming.y * outgoing.x &&
        dot(incoming, outgoing) > 0
      ) {
        result.pop()
      }
    }
    result.push(point)
  }
  return result
}

const elbowClearance = 24

function elbowCandidates(a: Point, b: Point): Point[][] {
  const xLanes = [
    (a.x + b.x) / 2,
    Math.min(a.x, b.x) - elbowClearance,
    Math.max(a.x, b.x) + elbowClearance,
  ]
  const yLanes = [
    (a.y + b.y) / 2,
    Math.min(a.y, b.y) - elbowClearance,
    Math.max(a.y, b.y) + elbowClearance,
  ]

  return [
    [a, { x: b.x, y: a.y }, b],
    [a, { x: a.x, y: b.y }, b],
    ...xLanes.map((x) => [a, { x, y: a.y }, { x, y: b.y }, b]),
    ...yLanes.map((y) => [a, { x: a.x, y }, { x: b.x, y }, b]),
  ]
}

function elbowLeg(from: Port, to: Port) {
  const start = from.point
  const end = to.point
  const travel = delta(start, end)
  if (
    from.direction &&
    to.direction &&
    dot(from.direction, to.direction) === -1
  ) {
    const lead = dot(travel, from.direction)
    // Grid layout can place visually aligned anchors a fraction of a pixel apart.
    const cross = from.direction.x * travel.y - from.direction.y * travel.x
    if (lead > 0 && Math.abs(cross) < 0.05) return [start, end]
  }

  const startLead = from.direction
    ? move(start, from.direction, elbowClearance)
    : start
  const endLead = to.direction ? move(end, to.direction, elbowClearance) : end
  // Try direct bends first, then bends with extra room to leave and enter the chosen sides.
  const candidates = [
    ...elbowCandidates(start, end),
    ...elbowCandidates(startLead, endLead).map((points) => [
      start,
      ...points,
      end,
    ]),
  ]

  let best: Point[] | undefined
  let bestScore = Infinity
  for (const candidate of candidates) {
    const points = compact(candidate)
    if (points.length < 2) continue
    if (from.direction && dot(delta(start, points[1]!), from.direction) <= 0)
      continue
    if (to.direction && dot(delta(end, points.at(-2)!), to.direction) <= 0)
      continue

    let score = 0
    for (let i = 1; i < points.length; i++) {
      const segment = delta(points[i - 1]!, points[i]!)
      if (i > 1 && dot(delta(points[i - 2]!, points[i - 1]!), segment) < 0) {
        score = Infinity
        break
      }
      score += Math.abs(segment.x) + Math.abs(segment.y) + 8
    }

    if (score < bestScore) {
      best = points
      bestScore = score
    }
  }
  return best ?? compact([start, { x: end.x, y: start.y }, end])
}

function steppedLeg(
  points: Point[],
  { lead, position = 0.56 }: ConnectionStep = {}
) {
  const [start, corner, end] = points
  if (points.length !== 3 || !start || !corner || !end) return points

  const horizontalFirst = start.y === corner.y
  const horizontalEnd = horizontalFirst ? start : end
  const verticalEnd = horizontalFirst ? end : start
  const { x, y } = delta(horizontalEnd, verticalEnd)
  const width = Math.abs(x)
  const leadLength = Math.min(
    lead ?? Math.max(width * 0.28, Math.abs(y) * 0.25),
    width / 2
  )
  if (!(leadLength > 0 && position > 0 && position < 1)) return points

  const stepX = horizontalEnd.x + Math.sign(x) * leadLength
  const stepY = horizontalEnd.y + y * position
  const stepped = [
    horizontalEnd,
    { x: stepX, y: horizontalEnd.y },
    { x: stepX, y: stepY },
    { x: verticalEnd.x, y: stepY },
    verticalEnd,
  ]
  return horizontalFirst ? stepped : stepped.reverse()
}

function roundedPath(points: Point[], radius: number, cornerFraction = 0.5) {
  return points
    .map((point, i) => {
      if (i === 0) return `M${svgPoint(point)}`
      const previous = points[i - 1]!
      const next = points[i + 1]
      if (
        !next ||
        radius <= 0 ||
        dot(delta(previous, point), delta(point, next)) !== 0
      ) {
        return `L${svgPoint(point)}`
      }

      const inset = Math.min(
        radius,
        distance(point, previous) * cornerFraction,
        distance(point, next) * cornerFraction
      )
      const before = move(point, unit(point, previous), inset)
      const after = move(point, unit(point, next), inset)
      return `L${svgPoint(before)} Q${svgPoint(point)} ${svgPoint(after)}`
    })
    .join(" ")
}

function curvePath(ports: Port[]) {
  const tangents = ports.map((port, i) => {
    if (port.direction) {
      return i === ports.length - 1
        ? { x: -port.direction.x, y: -port.direction.y }
        : port.direction
    }
    return unit(
      ports[i - 1]?.point ?? port.point,
      ports[i + 1]?.point ?? port.point
    )
  })

  return ports
    .map(({ point }, i) => {
      if (i === 0) return `M${svgPoint(point)}`
      const previous = ports[i - 1]!.point
      const length = Math.min(distance(previous, point) * 0.42, 100)
      const controlA = move(previous, tangents[i - 1]!, length)
      const controlB = move(point, tangents[i]!, -length)
      return `C${svgPoint(controlA)} ${svgPoint(controlB)} ${svgPoint(point)}`
    })
    .join(" ")
}

export type ConnectionRoute = {
  from: ConnectionAnchor
  to: ConnectionAnchor
  via?: readonly ConnectionWaypoint[]
  shape?: ConnectionShape
  /** Maximum corner radius in pixels. Defaults to 14. */
  radius?: number
  /** Geometry of the decorative bend for the stepped shape. */
  step?: ConnectionStep
}

export function getConnectionPath(
  layout: ConnectionLayout,
  { from, to, via = [], shape = "stepped", radius = 14, step }: ConnectionRoute
) {
  const references = [from, ...via, to]
  const locations = references.map((reference) => {
    if (typeof reference === "object" && "x" in reference) {
      return {
        point: {
          x: reference.x * layout.width,
          y: reference.y * layout.height,
        },
      }
    }
    const box = layout.nodes.get(
      typeof reference === "string" ? reference : reference.node
    )
    return box ? { point: center(box), box, anchor: reference } : null
  })

  const ports: Port[] = []
  for (const [i, location] of locations.entries()) {
    if (!location) return undefined
    if (location.box && location.anchor) {
      const adjacent = locations[i + 1] ?? locations[i - 1]
      const endpoint = i === 0 || i === locations.length - 1
      const anchor = location.anchor
      if (!endpoint && (typeof anchor === "string" || !anchor.side)) {
        ports.push({ point: location.point })
      } else {
        const port = resolveAnchor(
          anchor,
          location.box,
          adjacent?.point ?? location.point
        )
        ports.push(endpoint ? port : { point: port.point })
      }
    } else {
      ports.push({ point: location.point })
    }
  }

  if (shape === "curve") return curvePath(ports)

  const points = ports
    .slice(1)
    .flatMap((port, index) => steppedLeg(elbowLeg(ports[index]!, port), step))
  // Leave a straight section between adjacent curves on automatic steps.
  const autoStep = step?.lead === undefined || step.position === undefined
  return roundedPath(compact(points), radius, autoStep ? 1 / 3 : 0.5)
}
