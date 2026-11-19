"use client"

import { useImperativeHandle, useRef, useState, type RefObject } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  OverlayActions,
  OverlayHeader,
} from "@workspace/ui/components/overlay-layout"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog"

export type CloseConfirmationOptions = {
  /** Whether a close request currently needs confirmation. */
  when: boolean
  title?: string
  description?: string
  cancelLabel?: string
  confirmLabel?: string
  /** Called after the confirmed close request unless onOpenChange cancels it. */
  onConfirm?: () => void
}

type ImperativeOverlayActions = { close: () => void; unmount: () => void }

export function useCloseConfirmation<
  EventDetails extends { cancel: () => void; readonly isCanceled: boolean },
>({
  options,
  open,
  defaultOpen = false,
  onOpenChange,
  actionsRef,
}: {
  options?: CloseConfirmationOptions
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, details: EventDetails) => void
  actionsRef?: RefObject<ImperativeOverlayActions | null>
}) {
  const [pending, setPending] = useState(false)
  const uncontrolledOpen = useRef(defaultOpen)
  const confirmed = useRef(false)
  const overlayActions = useRef<ImperativeOverlayActions>(null)

  useImperativeHandle(
    actionsRef,
    () => ({
      close: () => overlayActions.current?.close(),
      unmount: () => overlayActions.current?.unmount(),
    }),
    []
  )

  if (pending && (open === false || !options)) {
    setPending(false)
  }

  function handleOpenChange(nextOpen: boolean, details: EventDetails) {
    const isOpen = open ?? uncontrolledOpen.current
    if (
      isOpen &&
      !nextOpen &&
      !confirmed.current &&
      (pending || options?.when)
    ) {
      details.cancel()
      setPending(true)
      return
    }

    onOpenChange?.(nextOpen, details)
    if (details.isCanceled) return

    if (open === undefined) uncontrolledOpen.current = nextOpen
    if (!nextOpen && confirmed.current) {
      options?.onConfirm?.()
    }
  }

  function confirm() {
    // Use the native close action so the overlay runs its normal close lifecycle.
    confirmed.current = true
    try {
      overlayActions.current?.close()
    } finally {
      confirmed.current = false
      setPending(false)
    }
  }

  return {
    actionsRef: overlayActions,
    onOpenChange: handleOpenChange,
    dialog: options && (
      <CloseConfirmationDialog
        options={options}
        open={pending && open !== false}
        onCancel={() => setPending(false)}
        onConfirm={confirm}
      />
    ),
  }
}

function CloseConfirmationDialog({
  options: {
    title = "Discard changes?",
    description = "Your unsaved changes will be lost.",
    cancelLabel = "Keep editing",
    confirmLabel = "Discard",
  },
  open,
  onCancel,
  onConfirm,
}: {
  options: CloseConfirmationOptions
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const cancelButton = useRef<HTMLButtonElement>(null)

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent forceBackdrop initialFocus={cancelButton}>
        <OverlayHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </OverlayHeader>
        <OverlayActions
          primary={
            <DialogClose
              render={<Button ref={cancelButton} type="button" size="sm" />}
            >
              {cancelLabel}
            </DialogClose>
          }
          secondary={
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  )
}
