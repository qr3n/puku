"use client"

import {
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
    placeholder?: ReactNode
    searchPlaceholder?: string
    searchLabel?: string
    emptyMessage?: ReactNode
    className?: string
  }

const optionHeight = 44
type SearchableSelectListActions = {
  highlight: (index: number | null, scroll: boolean) => void
}

export function SearchableSelect<Value extends string | number>({
  options,
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
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: SearchableSelectProps<Value>) {
  const listActions = useRef<SearchableSelectListActions | null>(null)
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
      id={id}
      items={items}
      disabled={disabled || options.length === 0}
      virtualized
      autoHighlight
      onValueChange={(value, details) => {
        // Closed-trigger typeahead can select a value without mounting its item.
        if (
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
            <Combobox.Empty className="px-3 py-2 text-sm text-muted-foreground">
              {emptyMessage}
            </Combobox.Empty>
            <SearchableSelectList<Value> actionsRef={listActions} />
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

function SearchableSelectList<Value extends string | number>({
  actionsRef,
}: {
  actionsRef: RefObject<SearchableSelectListActions | null>
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
    <Combobox.List ref={scrollRef} className="ui-searchable-select-list">
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
