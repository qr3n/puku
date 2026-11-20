"use client"

import { useOverlayHistoryProps } from "@workspace/ui/hooks/use-overlay-history"
import { Dialog as Primitive } from "@base-ui/react/dialog"
import {
  useCloseConfirmation,
  type CloseConfirmationOptions,
} from "@workspace/ui/components/close-confirmation"
import { cn } from "@workspace/ui/lib/utils"

export function Modal<Payload>({
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

export const ModalTrigger = Primitive.Trigger
export const ModalClose = Primitive.Close
export const ModalTitle = Primitive.Title
export const ModalDescription = Primitive.Description

export function ModalContent({
  className,
  ...props
}: Omit<Primitive.Popup.Props, "className"> & { className?: string }) {
  return (
    <Primitive.Portal>
      <Primitive.Backdrop className="ui-overlay-backdrop ui-centered-backdrop" />
      <Primitive.Viewport className="ui-centered-viewport">
        <Primitive.Popup
          {...props}
          data-stack-actions=""
          className={cn("ui-centered-panel", className)}
        />
      </Primitive.Viewport>
    </Primitive.Portal>
  )
}
