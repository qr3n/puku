"use client"

import { Globe, Server, UserRound } from "lucide-react"
import { useState } from "react"
import {
  ConnectionDiagram,
  type ConnectionShape,
  type DiagramConnection,
} from "@workspace/ui/components/connection-diagram"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import { Switch } from "@workspace/ui/components/switch"

const servers = [
  { id: "west", name: "West", side: "left" },
  { id: "central", name: "Central", side: "bottom" },
  { id: "east", name: "East", side: "right" },
] as const

const shapes = [
  { value: "stepped", label: "Stepped" },
  { value: "elbow", label: "Rounded elbow" },
  { value: "curve", label: "Curve" },
  { value: "straight", label: "Straight" },
] as const

export function ConnectionDiagramExample() {
  const [shape, setShape] = useState<ConnectionShape>("stepped")
  const [backup, setBackup] = useState(true)
  const visibleServers = backup ? servers : servers.slice(0, 2)
  const connections = visibleServers.flatMap<DiagramConnection>(
    ({ id, side }) => {
      const style =
        id === "central"
          ? { stroke: "var(--success-foreground)", strokeWidth: 3 }
          : id === "east"
            ? { strokeDasharray: "5 6" }
            : {}

      return [
        {
          id: `client-${id}`,
          from: { node: "client", side },
          to: { node: id, side: "top" },
          shape,
          ...style,
        },
        {
          id: `${id}-network`,
          from: { node: id, side: "bottom" },
          to: { node: "network", side: side === "bottom" ? "top" : side },
          shape,
          ...style,
        },
      ]
    }
  )

  return (
    <section id="connection-diagram" className="space-y-3">
      <h2 className="text-lg font-medium">Connection Diagram</h2>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <RadioGroup
          aria-label="Line shape"
          className="flex flex-wrap gap-x-4"
          value={shape}
          onValueChange={setShape}
        >
          {shapes.map(({ value, label }) => (
            <RadioGroupItem key={value} value={value} label={label} />
          ))}
        </RadioGroup>
        <Switch
          label="Backup server"
          checked={backup}
          onCheckedChange={setBackup}
        />
      </div>
      <ConnectionDiagram
        role="group"
        aria-label="Client connects to the network through the server locations"
        connections={connections}
        className="grid justify-items-center gap-16 rounded-2xl border bg-background p-4 sm:gap-20 sm:p-8"
      >
        <div
          className="flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm font-medium"
          data-connection-node="client"
        >
          <UserRound aria-hidden className="size-4" />
          Client
        </div>
        <div className="grid w-full grid-cols-3 justify-items-center gap-1 sm:gap-4">
          {visibleServers.map(({ id, name }) => (
            <div
              key={id}
              className="flex w-full max-w-28 min-w-0 flex-col items-center gap-2 rounded-xl border bg-background p-2 text-sm font-medium sm:p-3"
              data-connection-node={id}
            >
              <Server aria-hidden className="size-4 text-muted-foreground" />
              {name}
            </div>
          ))}
        </div>
        <div
          className="flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm font-medium"
          data-connection-node="network"
        >
          <Globe aria-hidden className="size-4" />
          Network
        </div>
      </ConnectionDiagram>
    </section>
  )
}
