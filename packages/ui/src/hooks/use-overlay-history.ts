"use client"

import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react"
import { flushSync } from "react-dom"

const historyKey = "__workspaceOverlay"

type Layer = {
  url: string
  close: () => void
}

type HistoryEntry = {
  id: string
  url: string
}

// Only needed to skip retired entries when traversing between pages or hashes.
type BrowserNavigation = EventTarget & {
  currentEntry: { index: number } | null
  canGoForward: boolean
}
type BrowserEntryChangeEvent = Event & {
  navigationType: string
  from: { index: number }
}

const layers: Layer[] = []
let entry: HistoryEntry | undefined
let nextId = 0
let removingEntry = false
let listening = false
let navigation: BrowserNavigation | undefined
let traversal = 0

function syncHistory() {
  if (removingEntry) return

  const url = window.location.href
  const isCurrent =
    entry?.id === window.history.state?.[historyKey] && entry?.url === url
  const hasOpenLayer = layers.some((layer) => layer.url === url)

  if (!isCurrent) entry = undefined

  if (hasOpenLayer && !isCurrent) {
    const id = `${Date.now()}-${++nextId}`
    window.history.pushState({ ...window.history.state, [historyKey]: id }, "")
    entry = { id, url }
  } else if (!hasOpenLayer && isCurrent) {
    removingEntry = true
    window.history.back()
  }
}

function handleEntryChange(event: Event) {
  const { navigationType, from } = event as BrowserEntryChangeEvent
  if (navigationType === "traverse" && from.index >= 0) {
    traversal = Math.sign((navigation?.currentEntry?.index ?? -1) - from.index)
  }
}

function handlePopState(event: PopStateEvent) {
  const wasRemoving = removingEntry
  const direction = traversal
  removingEntry = false
  traversal = 0

  const destinationId = event.state?.[historyKey]
  if (destinationId) {
    if (destinationId !== entry?.id && direction) {
      // A link may have navigated while its layer was closing. Its temporary
      // entry has no UI to restore when the user later traverses through it.
      window.history.go(direction > 0 && navigation?.canGoForward ? 1 : -1)
    }
    return
  }

  if (!entry) return

  const url = window.location.href
  const wasOnOverlay = entry.url === url && direction <= 0
  entry = undefined

  if (!wasOnOverlay) return

  const top = layers.filter((layer) => layer.url === url).at(-1)
  if (top && !wasRemoving) {
    // Commit the close or its confirmation before deciding if Back still has
    // an overlay to dismiss. The primitive manages the exit transition.
    flushSync(top.close)
  }
  syncHistory()
}

/**
 * Gives the active overlays on this page a temporary browser-history entry.
 * Back dismisses the most recently opened layer through its normal close action.
 */
export function useOverlayHistory(open: boolean, close: () => void) {
  const closeRef = useRef(close)

  useLayoutEffect(() => {
    closeRef.current = close
  }, [close])

  useLayoutEffect(() => {
    if (!open) return

    if (!listening) {
      navigation = (window as Window & { navigation?: BrowserNavigation })
        .navigation
      navigation?.addEventListener("currententrychange", handleEntryChange)
      window.addEventListener("popstate", handlePopState)
      listening = true
    }

    const layer = { url: window.location.href, close: () => closeRef.current() }
    layers.push(layer)
    syncHistory()

    return () => {
      layers.splice(layers.indexOf(layer), 1)
      // Let a closing link navigate and let other layers commit before
      // removing the temporary entry.
      window.setTimeout(syncHistory, 0)
    }
  }, [open])
}

type OverlayActions = { close: () => void; unmount: () => void }

export function useOverlayHistoryProps<
  Details extends { readonly isCanceled: boolean },
>({
  open,
  defaultOpen = false,
  onOpenChange,
  actionsRef,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, details: Details) => void
  actionsRef?: RefObject<OverlayActions | null>
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const actions = useRef<OverlayActions>(null)

  useImperativeHandle(
    actionsRef,
    () => ({
      close: () => actions.current?.close(),
      unmount: () => actions.current?.unmount(),
    }),
    []
  )

  useOverlayHistory(open ?? uncontrolledOpen, () => actions.current?.close())

  return {
    actionsRef: actions,
    onOpenChange(nextOpen: boolean, details: Details) {
      onOpenChange?.(nextOpen, details)
      if (open === undefined && !details.isCanceled) {
        setUncontrolledOpen(nextOpen)
      }
    },
  }
}
