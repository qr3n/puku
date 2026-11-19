"use client"

import { createContext, useContext, useId, useRef, useState } from "react"
import { Tooltip as Primitive } from "@base-ui/react/tooltip"
import { cn } from "@workspace/ui/lib/utils"

const TooltipContext = createContext<{
  handle: Primitive.Handle<unknown>
  contentId: string
  disabled?: boolean
} | null>(null)

export const TooltipProvider = Primitive.Provider

export function Tooltip({
  contentId,
  disabled,
  handle,
  ...props
}: Primitive.Root.Props & { contentId?: string }) {
  const generatedId = useId()
  const [internalHandle] = useState(() => Primitive.createHandle())
  const activeHandle = handle ?? internalHandle

  return (
    <TooltipContext.Provider
      value={{
        handle: activeHandle,
        contentId: contentId ?? generatedId,
        disabled,
      }}
    >
      <Primitive.Root {...props} handle={activeHandle} disabled={disabled} />
    </TooltipContext.Provider>
  )
}

type TooltipTriggerProps = Primitive.Trigger.Props & {
  openOnTap?: boolean
}

export function TooltipTrigger({
  "aria-describedby": describedBy,
  id,
  handle,
  disabled,
  openOnTap = false,
  closeOnClick = !openOnTap,
  onPointerCancel,
  onPointerDown,
  onClick,
  ...props
}: TooltipTriggerProps) {
  const context = useContext(TooltipContext)
  const generatedId = useId()
  const triggerId = id ?? generatedId
  const triggerHandle = handle ?? context?.handle
  const triggerDisabled = disabled ?? context?.disabled
  const descriptionIds = [describedBy, !triggerDisabled && context?.contentId]
    .filter(Boolean)
    .join(" ")
  const touchPress = useRef<{ wasOpen: boolean } | null>(null)

  return (
    <Primitive.Trigger
      {...props}
      id={triggerId}
      aria-describedby={descriptionIds || undefined}
      handle={triggerHandle}
      disabled={triggerDisabled}
      closeOnClick={closeOnClick}
      onPointerCancel={(event) => {
        touchPress.current = null
        onPointerCancel?.(event)
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        touchPress.current =
          openOnTap && event.pointerType === "touch" && !event.defaultPrevented
            ? { wasOpen: event.currentTarget.hasAttribute("data-popup-open") }
            : null
      }}
      onClick={(event) => {
        onClick?.(event)
        const press = touchPress.current
        touchPress.current = null
        if (
          !press ||
          event.detail === 0 ||
          triggerDisabled ||
          event.defaultPrevented
        )
          return

        if (press.wasOpen) {
          triggerHandle?.close()
        } else {
          triggerHandle?.open(triggerId)
        }
      }}
    />
  )
}

type TooltipContentProps = Omit<Primitive.Popup.Props, "className" | "id"> &
  Pick<
    Primitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "collisionAvoidance"
  > & { className?: string }

export function TooltipContent({
  side = "top",
  align = "center",
  sideOffset = 6,
  alignOffset,
  collisionAvoidance = {
    side: "flip",
    align: "shift",
    fallbackAxisSide: "end",
  },
  className,
  ...props
}: TooltipContentProps) {
  const context = useContext(TooltipContext)

  return (
    <Primitive.Portal keepMounted>
      <Primitive.Positioner
        className="ui-floating-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={8}
        collisionAvoidance={collisionAvoidance}
      >
        <Primitive.Popup
          {...props}
          id={context?.contentId}
          role="tooltip"
          className={cn("ui-floating-panel ui-tooltip-content", className)}
        />
      </Primitive.Positioner>
    </Primitive.Portal>
  )
}
