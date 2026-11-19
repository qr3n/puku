"use client"

import { useOverlayHistoryProps } from "@workspace/ui/hooks/use-overlay-history"
import type { ReactNode } from "react"
import { Drawer as Primitive } from "@base-ui/react/drawer"
import {
  useCloseConfirmation,
  type CloseConfirmationOptions,
} from "@workspace/ui/components/close-confirmation"
import { cn } from "@workspace/ui/lib/utils"

export function Drawer<Payload>({
  confirmClose,
  children,
  ...props
}: Primitive.Root.Props<Payload> & {
  /** Guard dismissal requests, including actionsRef.close(). Setting open directly controls the overlay. */
  confirmClose?: CloseConfirmationOptions
}) {
  const { dialog, ...confirmation } =
    useCloseConfirmation<Primitive.Root.ChangeEventDetails>({
      options: confirmClose,
      open: props.open,
      defaultOpen: props.defaultOpen,
      onOpenChange: props.onOpenChange,
      actionsRef: props.actionsRef,
    })
  const history = useOverlayHistoryProps({ ...props, ...confirmation })

  return (
    <Primitive.Root {...props} {...history}>
      {(state) => (
        <>
          {typeof children === "function" ? children(state) : children}
          {dialog}
        </>
      )}
    </Primitive.Root>
  )
}

export const DrawerTrigger = Primitive.Trigger
export const DrawerClose = Primitive.Close
export const DrawerTitle = Primitive.Title
export const DrawerDescription = Primitive.Description

type DrawerContentProps = Omit<Primitive.Popup.Props, "className"> & {
  className?: string
  side?: "bottom" | "right"
  /** Mount the panel before its first open and preserve its contents between visits. */
  keepMounted?: boolean
  /** Stays above the scrolling body. May include Cancel and Done in an editor. */
  header?: ReactNode
}

export function DrawerContent({
  side = "bottom",
  className,
  keepMounted,
  header,
  children,
  ...props
}: DrawerContentProps) {
  return (
    <Primitive.Portal keepMounted={keepMounted}>
      <Primitive.Backdrop
        className={cn(
          "ui-overlay-backdrop",
          side === "right" && "ui-sheet-backdrop"
        )}
      />
      <Primitive.Viewport
        className={cn(
          "ui-drawer-viewport",
          side === "right" && "ui-sheet-viewport"
        )}
      >
        <Primitive.Popup
          {...props}
          data-fixed-header={header ? "" : undefined}
          className={cn(
            "ui-drawer-panel",
            side === "right" && "ui-sheet-panel",
            className
          )}
        >
          {side === "bottom" && (
            <div
              aria-hidden
              className="-mx-4 -mt-4 mb-2 flex h-9 shrink-0 cursor-grab touch-none items-center justify-center select-none active:cursor-grabbing"
            >
              <div className="h-1.5 w-10 rounded-full bg-progress-track" />
            </div>
          )}
          {header}
          <Primitive.Content
            className={
              side === "right"
                ? "flex min-h-full flex-col gap-5"
                : header
                  ? "ui-drawer-body"
                  : undefined
            }
          >
            {children}
          </Primitive.Content>
        </Primitive.Popup>
      </Primitive.Viewport>
    </Primitive.Portal>
  )
}
