import { Globe, Server, UserRound } from "lucide-react"
import {
  ConnectionDiagram,
  type DiagramConnection,
} from "@workspace/ui/components/connection-diagram"

const locations = [
  { id: "finland", name: "Финляндия", side: "left" },
  { id: "estonia", name: "Эстония", side: "bottom" },
  { id: "germany", name: "Германия", side: "right" },
] as const

const connections = locations.flatMap<DiagramConnection>(({ id, side }) => [
  {
    id: `client-${id}`,
    from: { node: "client", side },
    to: { node: id, side: "top" },
    shape: side === "bottom" ? "straight" : "stepped",
    radius: 22,
    step: { lead: 28, position: 0.46 },
  },
  {
    id: `${id}-network`,
    from: { node: id, side: "bottom" },
    to: { node: "network", side: side === "bottom" ? "top" : side },
    shape: side === "bottom" ? "straight" : "stepped",
    radius: 22,
    step: { lead: 24, position: 0.5 },
  },
])

export function LocationSelectionDiagramExample() {
  return (
    <section id="location-selection-diagram" lang="ru" className="space-y-3">
      <h2 className="text-lg font-medium">Автовыбор локации</h2>
      <div className="rounded-2xl border bg-background p-4 sm:p-8">
        <div className="[container-type:inline-size] mx-auto max-w-[35rem]">
          <ConnectionDiagram
            role="group"
            aria-label="Маршруты от клиента к сети через три серверные локации"
            connections={connections}
            className="grid justify-items-center [--client-size:clamp(2.5rem,10cqw,3.5rem)] [--network-size:clamp(5.5rem,35cqw,13rem)] [--row-distance:clamp(8rem,36cqw,13rem)] [--server-height:clamp(3.5rem,14cqw,5rem)]"
          >
            <div
              role="img"
              aria-label="Клиент"
              data-connection-node="client"
              className="grid size-(--client-size) place-items-center rounded-full border bg-background"
            >
              <UserRound aria-hidden className="size-5 sm:size-6" />
            </div>
            <div className="mt-[calc(var(--row-distance)-(var(--client-size)+var(--server-height))/2)] grid w-full grid-cols-[35%_30%_35%] justify-items-center">
              {locations.map(({ id, name }) => (
                <div
                  key={id}
                  data-connection-node={id}
                  className="flex h-(--server-height) w-[min(88%,6.5rem)] flex-col items-center justify-center gap-1.5 rounded-xl border bg-background px-1 text-[clamp(0.625rem,2.6cqw,0.875rem)] font-medium"
                >
                  <Server
                    aria-hidden
                    className="size-4 text-muted-foreground"
                  />
                  {name}
                </div>
              ))}
            </div>
            <div
              role="img"
              aria-label="Сеть"
              data-connection-node="network"
              className="mt-[calc(var(--row-distance)-(var(--server-height)+var(--network-size))/2)] grid size-(--network-size) place-items-center rounded-full border bg-background"
            >
              <Globe aria-hidden className="size-1/3 text-muted-foreground" />
            </div>
          </ConnectionDiagram>
        </div>
      </div>
    </section>
  )
}
