"use client"

import { useEffect, useRef, useState } from "react"
import { Home, KeyRound, Layers, ListOrdered } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { Input } from "@workspace/ui/components/input"
import { InputOTP } from "@workspace/ui/components/input-otp"
import {
  OverlayActions,
  OverlayHeader,
} from "@workspace/ui/components/overlay-layout"
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "@workspace/ui/components/modal"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetItem,
  SheetNav,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { StepperContent } from "@workspace/ui/components/stepper-content"
import { Stepper } from "@workspace/ui/components/stepper"

const steps = ["Choose device", "Install the app", "Connect", "Done"] as const

export function StepperExample() {
  const [step, setStep] = useState(0)
  const previousStep = useRef(step)
  const stepTitle = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (previousStep.current === step) return

    previousStep.current = step
    stepTitle.current?.focus({ preventScroll: true })
  }, [step])

  return (
    <div className="grid justify-items-start gap-3">
      <Stepper steps={steps} currentStep={step} label="Connection progress" />
      <StepperContent currentStep={step} className="w-full max-w-sm">
        {steps.map((title, index) => (
          <div key={title} className="space-y-1 rounded-2xl bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Step {index + 1} of {steps.length}
            </p>
            <h3
              ref={index === step ? stepTitle : undefined}
              tabIndex={-1}
              className="font-semibold"
            >
              {title}
            </h3>
          </div>
        ))}
      </StepperContent>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="tonal"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          Back
        </Button>
        <Button
          size="sm"
          disabled={step === steps.length - 1}
          onClick={() => setStep(step + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export function OTPExample() {
  const [complete, setComplete] = useState(false)

  return (
    <div className="grid gap-3">
      <p id="otp-example-help" className="text-sm text-muted-foreground">
        Enter or paste six digits.
      </p>
      <InputOTP
        label="Verification code"
        length={6}
        className="max-w-[min(100%,27.75rem)] min-w-0"
        aria-describedby="otp-example-help"
        onValueChange={(value) => setComplete(value.length === 6)}
      />
      <p className="min-h-5 text-sm text-muted-foreground" role="status">
        {complete ? "Code entered" : ""}
      </p>
    </div>
  )
}

const catalogLinks = [
  { href: "#catalog", label: "Overview", Icon: Home },
  { href: "#otp-input", label: "OTP input", Icon: KeyRound },
  { href: "#stepper", label: "Stepper", Icon: ListOrdered },
  { href: "#overlays", label: "Overlays", Icon: Layers },
] as const

function SheetExample() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>("#catalog")

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="tonal" />}>Sheet</SheetTrigger>
      <SheetContent>
        <header className="px-2 pt-2">
          <SheetTitle className="text-2xl font-semibold">
            Catalog navigation
          </SheetTitle>
          <SheetDescription className="sr-only">
            Jump to a section of the component catalog.
          </SheetDescription>
        </header>
        <SheetNav aria-label="Catalog sections">
          {catalogLinks.map(({ href, label, Icon }) => (
            <SheetItem
              key={href}
              href={href}
              aria-current={href === active ? "location" : undefined}
              icon={<Icon />}
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return
                setActive(href)
                setOpen(false)
              }}
            >
              {label}
            </SheetItem>
          ))}
        </SheetNav>
        <SheetFooter>
          <SheetClose render={<Button className="w-full" />}>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function OverlayExamples() {
  const [note, setNote] = useState("")
  const [savedName, setSavedName] = useState("")
  const [draftName, setDraftName] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const keepEditing = useRef<HTMLButtonElement>(null)

  return (
    <div className="flex flex-wrap gap-3">
      <Drawer
        confirmClose={{
          when: note !== "",
          onConfirm: () => setNote(""),
        }}
      >
        <DrawerTrigger render={<Button variant="tonal" />}>
          Drawer
        </DrawerTrigger>
        <DrawerContent
          header={
            <OverlayHeader>
              <DrawerTitle>Quick note</DrawerTitle>
              <DrawerDescription>
                This draft lasts until you close the note.
              </DrawerDescription>
            </OverlayHeader>
          }
        >
          <Input
            containerClassName="mt-4"
            label="Note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <OverlayActions
            primary={<DrawerClose render={<Button />}>Close</DrawerClose>}
          />
        </DrawerContent>
      </Drawer>
      <SheetExample />
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        confirmClose={{
          when: draftName !== savedName,
          title: "Discard this name?",
          description: "Your changes to the name will be lost.",
          confirmLabel: "Discard name",
          onConfirm: () => setDraftName(savedName),
        }}
      >
        <ModalTrigger render={<Button variant="tonal" />}>Modal</ModalTrigger>
        <ModalContent>
          <OverlayHeader>
            <ModalTitle>Edit name</ModalTitle>
            <ModalDescription className="sr-only">
              Update your display name.
            </ModalDescription>
          </OverlayHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setSavedName(draftName)
              setModalOpen(false)
            }}
          >
            <Input
              containerClassName="mt-4"
              label="Name"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
            />
            <OverlayActions
              primary={<Button type="submit">Save</Button>}
              secondary={
                <ModalClose render={<Button type="button" variant="tonal" />}>
                  Cancel
                </ModalClose>
              }
            />
          </form>
        </ModalContent>
      </Modal>
      <Dialog>
        <DialogTrigger render={<Button variant="tonal" />}>
          Dialog
        </DialogTrigger>
        <DialogContent initialFocus={keepEditing}>
          <OverlayHeader>
            <DialogTitle>Leave without saving?</DialogTitle>
            <DialogDescription>Your changes will be lost.</DialogDescription>
          </OverlayHeader>
          <OverlayActions
            primary={
              <DialogClose render={<Button ref={keepEditing} size="sm" />}>
                Keep editing
              </DialogClose>
            }
            secondary={
              <DialogClose render={<Button variant="destructive" size="sm" />}>
                Discard changes
              </DialogClose>
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
