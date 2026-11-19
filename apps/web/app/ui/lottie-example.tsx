"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Lottie, LottieSkeleton } from "@workspace/ui/components/lottie"
import {
  Pagination,
  PaginationContent,
} from "@workspace/ui/components/pagination"
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
      {pageCount === 0 ? (
        <p role="status" className="text-sm text-muted-foreground">
          No animations found.
        </p>
      ) : (
        <PaginationContent key={query} page={page} className="-m-1">
          {(pageIndex) => (
            <div className="flex flex-wrap gap-1 p-1">
              {matchingNames
                .slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
                .map((animationName) => (
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
          )}
        </PaginationContent>
      )}
      <Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        label="Animation pages"
      />
    </div>
  )
}
