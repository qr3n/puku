"use client"

import { useOverlayHistoryProps } from "@workspace/ui/hooks/use-overlay-history"
import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import { Combobox } from "@base-ui/react/combobox"
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual"
import { Check, ChevronDown, Search } from "lucide-react"
import type { SelectOption } from "@workspace/ui/components/select"
import {
  TextField,
  type FieldTextProps,
} from "@workspace/ui/components/text-field"
import { cn } from "@workspace/ui/lib/utils"

type SearchableSelectProps<Value> = Pick<
  Combobox.Root.Props<Value>,
  | "id"
  | "name"
  | "form"
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "onInputValueChange"
  | "disabled"
  | "required"
> &
  Pick<Combobox.Positioner.Props, "side" | "align"> &
  Pick<
    Combobox.Trigger.Props,
    "aria-label" | "aria-describedby" | "aria-invalid"
  > &
  FieldTextProps & {
    options: readonly SelectOption<Value>[]
    /** Filter a large local collection in a dedicated worker. */
    filterInWorker?: boolean
    /** Results from an external search. Keep the full collection in options for selection and typeahead. */
    filteredOptions?: readonly SelectOption<Value>[]
    placeholder?: ReactNode
    searchPlaceholder?: string
    searchLabel?: string
    emptyMessage?: ReactNode
    className?: string
  }

const optionHeight = 44

function useOptionSearch<Value>(
  options: readonly SelectOption<Value>[],
  query: string,
  enabled: boolean
) {
  const worker = useRef<Worker | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const [result, setResult] = useState<{
    source: typeof options
    query: string
    matches: SelectOption<Value>[]
  } | null>(null)
  if (result && (!query || result.source !== options || !enabled)) {
    setResult(null)
  }

  useEffect(() => {
    if (!enabled || unavailable) return
    let instance: Worker | undefined
    try {
      instance = new Worker(
        new URL("./searchable-select.worker.ts", import.meta.url),
        {
          type: "module",
        }
      )
      instance.onerror = () => setUnavailable(true)
      instance.postMessage(options.map((option) => option.label))
      worker.current = instance
    } catch {
      // Worker creation can be blocked by the embedding application's CSP.
      setUnavailable(true)
    }
    return () => {
      worker.current = null
      if (instance) {
        instance.onerror = null
        instance.terminate()
      }
    }
  }, [enabled, options, unavailable])

  useEffect(() => {
    const instance = worker.current
    if (!instance || !query) return
    instance.onmessage = (
      event: MessageEvent<{ query: string; indexes: number[] }>
    ) => {
      if (event.data.query === query) {
        setResult({
          source: options,
          query,
          matches: event.data.indexes.map((index) => options[index]!),
        })
      }
    }
    instance.postMessage(query)
    return () => {
      instance.onmessage = null
    }
  }, [enabled, options, query, unavailable])

  const searching = enabled && !unavailable && Boolean(query)
  return {
    matches: searching ? (result?.matches ?? options) : undefined,
    busy: searching && result?.query !== query,
  }
}

type SearchableSelectListActions = {
  highlight: (index: number | null, scroll: boolean) => void
}

export function SearchableSelect<Value extends string | number>({
  options,
  filteredOptions,
  filterInWorker = false,
  id,
  label,
  helperText,
  error,
  placeholder = "Select an option",
  searchPlaceholder = "Search options",
  searchLabel = searchPlaceholder,
  emptyMessage = "No options found.",
  className,
  side = "bottom",
  align = "start",
  disabled,
  onValueChange,
  onInputValueChange,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: SearchableSelectProps<Value>) {
  const history = useOverlayHistoryProps<Combobox.Root.OpenChangeEventDetails>(
    {}
  )
  const listActions = useRef<SearchableSelectListActions | null>(null)
  const [query, setQuery] = useState("")
  const search = useOptionSearch(
    options,
    query,
    filterInWorker && filteredOptions === undefined
  )
  const items = useMemo(
    () =>
      Combobox.createItems(options, {
        getValue: (option) => option.value,
        getLabel: (option) => option.label,
      }),
    [options]
  )

  return (
    <Combobox.Root<Value, false, SelectOption<Value>>
      {...props}
      {...history}
      id={id}
      items={items}
      filteredItems={filteredOptions ?? search.matches}
      disabled={disabled || options.length === 0}
      virtualized
      autoHighlight
      onInputValueChange={(inputValue, details) => {
        onInputValueChange?.(inputValue, details)
        if (!details.isCanceled) {
          setQuery(details.reason === "input-change" ? inputValue.trim() : "")
        }
      }}
      onValueChange={(value, details) => {
        // Closed-trigger typeahead can select a value without mounting its item.
        if (
          search.busy ||
          options.find((option) => Object.is(option.value, value))?.disabled
        ) {
          details.cancel()
          return
        }
        onValueChange?.(value, details)
      }}
      onItemHighlighted={(value, { index, reason }) => {
        listActions.current?.highlight(
          value === undefined ? null : index,
          reason !== "pointer"
        )
      }}
    >
      <TextField
        id={id}
        label={label}
        helperText={helperText}
        error={error}
        containerClassName={cn("min-w-0", className)}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      >
        {(fieldProps) => (
          <Combobox.Trigger
            {...fieldProps}
            className="ui-text-field-control ui-select-trigger ui-searchable-select-trigger"
            aria-label={ariaLabel}
          >
            <span data-slot="select-value" className="min-w-0 truncate">
              <Combobox.Value placeholder={placeholder} />
            </span>
            <Combobox.Icon className="ui-select-icon">
              <ChevronDown className="size-4" aria-hidden />
            </Combobox.Icon>
          </Combobox.Trigger>
        )}
      </TextField>
      <Combobox.Portal>
        <Combobox.Positioner
          className="ui-floating-positioner"
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
          collisionAvoidance={{
            side: "flip",
            align: "shift",
            fallbackAxisSide: "end",
          }}
        >
          <Combobox.Popup
            className="ui-floating-panel ui-select-popup ui-searchable-select-popup"
            aria-label={searchLabel}
          >
            <div className="ui-searchable-select-search">
              <Search className="size-4 shrink-0" aria-hidden />
              <Combobox.Input
                aria-label={searchLabel}
                placeholder={searchPlaceholder}
              />
            </div>
            {!search.busy && (
              <Combobox.Empty className="px-3 py-2 text-sm text-muted-foreground">
                {emptyMessage}
              </Combobox.Empty>
            )}
            <SearchableSelectList<Value>
              actionsRef={listActions}
              busy={search.busy}
            />
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

function SearchableSelectList<Value extends string | number>({
  actionsRef,
  busy,
}: {
  actionsRef: RefObject<SearchableSelectListActions | null>
  busy: boolean
}) {
  const items = Combobox.useFilteredItems<SelectOption<Value>>()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => optionHeight,
    overscan: 6,
    rangeExtractor: (range) => {
      const indexes = defaultRangeExtractor(range)
      // Keep the active descendant available when the user scrolls away from it.
      if (
        highlightedIndex !== null &&
        highlightedIndex < range.count &&
        !indexes.includes(highlightedIndex)
      ) {
        indexes.push(highlightedIndex)
        indexes.sort((a, b) => a - b)
      }
      return indexes
    },
  })

  useImperativeHandle(
    actionsRef,
    () => ({
      highlight(index, scroll) {
        setHighlightedIndex(index)
        if (index !== null && scroll) {
          queueMicrotask(() => virtualizer.scrollToIndex(index))
        }
      },
    }),
    [virtualizer]
  )

  return (
    <Combobox.List
      ref={scrollRef}
      aria-busy={busy || undefined}
      className="ui-searchable-select-list"
    >
      {items.length > 0 && (
        <div
          role="presentation"
          className="relative"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map(({ index, size, start }) => {
            const option = items[index]!

            return (
              <Combobox.Item
                key={`${typeof option.value}:${option.value}`}
                index={index}
                value={option.value}
                disabled={option.disabled}
                aria-setsize={items.length}
                aria-posinset={index + 1}
                className="ui-menu-item absolute inset-x-0 top-0 min-h-0 justify-between"
                style={{ height: size, transform: `translateY(${start}px)` }}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                <Combobox.ItemIndicator className="shrink-0" aria-hidden>
                  <Check className="size-4" />
                </Combobox.ItemIndicator>
              </Combobox.Item>
            )
          })}
        </div>
      )}
    </Combobox.List>
  )
}
