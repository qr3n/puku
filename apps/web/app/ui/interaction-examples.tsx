"use client"

import { useState, useTransition } from "react"
import { ChevronDown, Info, RotateCcw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Checkbox, CheckboxGroup } from "@workspace/ui/components/checkbox"
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@workspace/ui/components/menu"
import { SearchableSelect } from "@workspace/ui/components/searchable-select"
import { Select } from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { toast } from "@workspace/ui/components/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

const sides = [
  { value: "bottom", label: "Bottom" },
  { value: "top", label: "Top" },
  { value: "right", label: "Right" },
  { value: "left", label: "Left" },
] as const
const notificationTypes = ["replies", "mentions"]
const devices = [
  { value: "phone", label: "Phone" },
  { value: "tablet", label: "Tablet" },
  { value: "computer", label: "Computer" },
  { value: "tv", label: "TV (unavailable)", disabled: true },
]
const offices = Array.from({ length: 10_000 }, (_, index) => ({
  value: index + 1,
  label: `Office ${String(index + 1).padStart(4, "0")}`,
  disabled: index === 1,
}))

export function MenuExample() {
  const [side, setSide] = useState<(typeof sides)[number]["value"]>("bottom")
  const [previews, setPreviews] = useState(true)
  const [timestamps, setTimestamps] = useState(false)

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Menu>
          <MenuTrigger render={<Button variant="tonal" size="sm" />}>
            View options <ChevronDown data-icon="inline-end" aria-hidden />
          </MenuTrigger>
          <MenuContent side={side}>
            <MenuCheckboxItem checked={previews} onCheckedChange={setPreviews}>
              Show previews
            </MenuCheckboxItem>
            <MenuCheckboxItem
              checked={timestamps}
              onCheckedChange={setTimestamps}
            >
              Show timestamps
            </MenuCheckboxItem>
            <MenuSeparator />
            <MenuItem
              onClick={() => {
                setPreviews(true)
                setTimestamps(false)
              }}
            >
              <RotateCcw className="size-5 shrink-0" aria-hidden />
              Reset options
            </MenuItem>
          </MenuContent>
        </Menu>
        <Select
          aria-label="Preferred menu side"
          value={side}
          options={sides}
          onValueChange={(nextSide) => {
            if (nextSide !== null) setSide(nextSide)
          }}
          className="w-32"
        />
      </div>
      <p className="text-sm text-muted-foreground" role="status">
        Previews {previews ? "on" : "off"}, timestamps{" "}
        {timestamps ? "on" : "off"}
      </p>
    </>
  )
}

export function TooltipExample() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="tonal"
            size="icon-sm"
            aria-label="About view options"
          />
        }
        openOnTap
      >
        <Info aria-hidden />
      </TooltipTrigger>
      <TooltipContent side="right">
        View options affect your device only.
      </TooltipContent>
    </Tooltip>
  )
}

export function CheckboxExample() {
  return (
    <div className="grid justify-items-start">
      <CheckboxGroup
        aria-label="Notifications"
        allValues={notificationTypes}
        defaultValue={["replies"]}
        className="grid justify-items-start"
      >
        <Checkbox parent label="All notifications" />
        <div className="grid justify-items-start pl-5">
          <Checkbox name="notifications" value="replies" label="Replies" />
          <Checkbox name="notifications" value="mentions" label="Mentions" />
        </div>
      </CheckboxGroup>
      <Checkbox label="System alerts" defaultChecked disabled />
    </div>
  )
}

export function SelectExample() {
  const [backupDevice, setBackupDevice] = useState<string | null>(null)

  return (
    <div className="grid max-w-xs gap-3">
      <Select
        name="device"
        label="Device"
        placeholder="Choose a device"
        helperText="This device receives notifications first."
        options={devices}
      />
      <Select
        name="backup-device"
        label="Backup device"
        placeholder="Choose a device"
        helperText="Used when your primary device is unavailable."
        error={backupDevice === null ? "Choose a backup device." : undefined}
        options={devices}
        value={backupDevice}
        onValueChange={setBackupDevice}
      />
    </div>
  )
}

export function SearchableSelectExample() {
  return (
    <SearchableSelect
      className="max-w-xs"
      name="office"
      label="Office"
      placeholder="Choose an office"
      searchPlaceholder="Search offices"
      emptyMessage="No offices found."
      helperText="Search across 10,000 offices."
      options={offices}
    />
  )
}

export function SwitchExample() {
  return (
    <div className="grid justify-items-start">
      <Switch label="Push notifications" defaultChecked />
      <Switch label="Notify on a new device" disabled />
    </div>
  )
}

export function ToastExample() {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        size="sm"
        onClick={() =>
          toast.success("Settings saved", { id: "settings-saved" })
        }
      >
        Success toast
      </Button>
      <Button
        size="sm"
        variant="tonal"
        onClick={() =>
          toast.error("Could not save settings. Try again.", {
            id: "settings-error",
          })
        }
      >
        Error toast
      </Button>
      <Button
        size="sm"
        variant="tonal"
        loading={pending}
        onClick={() => {
          const save = toast.promise(
            new Promise<void>((resolve) => setTimeout(resolve, 2200)),
            {
              loading: "Saving settings…",
              success: "Settings saved",
              error: "Could not save settings. Try again.",
            },
            { id: "settings-pending" }
          )
          startTransition(() => save)
        }}
      >
        Pending toast
      </Button>
    </div>
  )
}
