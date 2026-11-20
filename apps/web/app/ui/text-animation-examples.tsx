"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { ScrollRevealText } from "@workspace/ui/components/scroll-reveal-text"
import { SplitRevealText } from "@workspace/ui/components/split-reveal-text"
import { Switch } from "@workspace/ui/components/switch"

export function TextAnimationExamples() {
  const [replay, setReplay] = useState(0)
  const [offset, setOffset] = useState("0")
  const [playOnEntry, setPlayOnEntry] = useState(false)
  const [repeatOnEntry, setRepeatOnEntry] = useState(false)
  const viewport = { offset: Number(offset) || 0, once: !repeatOnEntry }
  const viewportKey = `${viewport.offset}:${viewport.once}`

  return (
    <section id="text-animation" className="space-y-6">
      <h2 className="text-lg font-medium">Text animation</h2>
      <Input
        label="Viewport offset (px)"
        helperText="Distance from the bottom of the viewport before an entry animation starts."
        type="number"
        min={0}
        value={offset}
        onChange={(event) => setOffset(event.currentTarget.value)}
        containerClassName="max-w-xs"
      />
      <Switch
        label="Replay on each entry"
        checked={repeatOnEntry}
        onCheckedChange={setRepeatOnEntry}
      />
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Split Reveal Text</h3>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
          <SplitRevealText
            key={`${viewportKey}:${replay}`}
            as="p"
            text="Буква за буквой"
            lang="ru"
            viewport={viewport}
            className="text-3xl font-semibold tracking-tight sm:text-5xl"
          />
          <Button
            variant="tonal"
            onClick={() => setReplay((value) => value + 1)}
          >
            Replay
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Scroll Reveal Text</h3>
        <Switch
          label="Play on viewport entry"
          checked={playOnEntry}
          onCheckedChange={setPlayOnEntry}
        />
        <div className="rounded-2xl border bg-background px-5 py-16 text-foreground sm:px-8">
          <ScrollRevealText
            key={playOnEntry ? viewportKey : "scroll"}
            text="Прокрутите страницу. Буквы по очереди будут становиться контрастнее от начала абзаца до последней точки."
            lang="ru"
            trigger={playOnEntry ? "inView" : "scroll"}
            viewport={viewport}
            offset={["start 70%", "end 55%"]}
            className="text-2xl leading-tight font-medium tracking-tight sm:text-4xl"
          />
        </div>
      </div>
    </section>
  )
}
