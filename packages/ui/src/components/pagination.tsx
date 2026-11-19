"use client"

import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { SlidingContent } from "@workspace/ui/components/sliding-content"
import { cn } from "@workspace/ui/lib/utils"

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  label?: string
  className?: string
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  label = "Pagination",
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null

  return (
    <nav
      aria-label={label}
      className={cn("flex w-fit items-center gap-2", className)}
    >
      <Button
        type="button"
        size="icon-xs"
        variant="tonal"
        aria-label="Previous page"
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft aria-hidden className="size-4" />
      </Button>
      <span
        role="status"
        className="min-w-14 text-center text-sm text-muted-foreground tabular-nums"
      >
        <span className="sr-only">
          Page {page + 1} of {pageCount}
        </span>
        <span aria-hidden>
          {page + 1} / {pageCount}
        </span>
      </span>
      <Button
        type="button"
        size="icon-xs"
        variant="tonal"
        aria-label="Next page"
        disabled={page >= pageCount - 1}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight aria-hidden className="size-4" />
      </Button>
    </nav>
  )
}

type PaginationContentProps = {
  page: number
  children: (page: number) => ReactNode
  className?: string
}

export function PaginationContent({
  page,
  children,
  className,
}: PaginationContentProps) {
  return (
    <SlidingContent
      index={page}
      renderContent={children}
      className={className}
    />
  )
}
