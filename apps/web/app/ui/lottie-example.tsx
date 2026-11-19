"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Lottie, LottieSkeleton } from "@workspace/ui/components/lottie"
import {
  getLottieAsset,
  lottieNames,
  type LottieName,
} from "@workspace/ui/lib/lottie"

const pageSize = 24

export function LottieExample() {
  const [page, setPage] = useState(0)
  const [name, setName] = useState<LottieName>("partying-face")
  const [query, setQuery] = useState("")
  const search = query
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, " ")
  const matchingNames = lottieNames.filter((name) =>
    name.replaceAll("-", " ").includes(search)
  )
  const pageCount = Math.ceil(matchingNames.length / pageSize)
  const pageNames = matchingNames.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Lottie name={name} size={64} loop label={`Animation ${name}`} />
        <LottieSkeleton name={name} size={64} label={`Skeleton ${name}`} />
        <Button lottieStart={name}>Continue</Button>
        <Button variant="tonal" lottieEnd={{ name, loop: true }}>
          Continue
        </Button>
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        <code>{`<Lottie name="${name}" />`}</code>
      </p>
      <Input
        label="Search animations by name"
        type="search"
        containerClassName="max-w-xs"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setPage(0)
        }}
      />
      {pageNames.length === 0 && (
        <p role="status" className="text-sm text-muted-foreground">
          No animations found.
        </p>
      )}
      <div className="flex flex-wrap gap-1">
        {pageNames.map((animationName) => (
          <Button
            key={animationName}
            size="icon-xs"
            variant={animationName === name ? "tonal" : "ghost"}
            aria-label={`Preview ${animationName.replaceAll("-", " ")}`}
            aria-pressed={animationName === name}
            title={animationName}
            onClick={() => setName(animationName)}
          >
            <Image
              src={getLottieAsset(animationName).firstFrame}
              alt=""
              width={32}
              height={32}
              unoptimized
              loading="lazy"
            />
          </Button>
        ))}
      </div>
      {pageCount > 1 && (
        <div className="flex items-center gap-3">
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="Previous animation page"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <span aria-live="polite" className="text-sm text-muted-foreground">
            {page + 1} / {pageCount}
          </span>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="Next animation page"
            disabled={page === pageCount - 1}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      )}
    </div>
  )
}
