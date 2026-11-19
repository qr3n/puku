"use client"

import { useOverlayHistoryProps } from "@workspace/ui/hooks/use-overlay-history"
import { usePressMotion } from "@workspace/ui/hooks/use-press-motion"
import type { ComponentProps, CSSProperties, ReactNode, Ref } from "react"
import { Select as Primitive } from "@base-ui/react/select"
import {
  TextField,
  type FieldTextProps,
} from "@workspace/ui/components/text-field"
import { cn } from "@workspace/ui/lib/utils"
import { motion } from "framer-motion"
import { Check, ChevronDown } from "lucide-react"

export type SelectOption<Value> = {
  value: Value
  label: string
  disabled?: boolean
}

const MotionSelectOption = motion.create(function MotionSelectOption({
  optionProps,
  ref,
  style,
}: {
  optionProps: ComponentProps<"div">
  ref?: Ref<HTMLDivElement>
  style?: CSSProperties
}) {
  return (
    <div
      {...optionProps}
      ref={ref}
      style={{ ...optionProps.style, ...style }}
    />
  )
})

function SelectOptionElement({
  disabled,
  ref,
  ...props
}: ComponentProps<"div"> & { disabled: boolean }) {
  const pressMotion = usePressMotion(disabled, 0.98)

  // Keep Base UI's option focus behavior when Motion adds a tab index for taps.
  return <MotionSelectOption {...pressMotion} optionProps={props} ref={ref} />
}

export function renderSelectOption(
  props: ComponentProps<"div">,
  { disabled }: { disabled: boolean }
) {
  return <SelectOptionElement {...props} disabled={disabled} />
}

type SelectProps<Value> = Omit<
  Primitive.Root.Props<Value>,
  "children" | "items" | "multiple"
> &
  Pick<Primitive.Positioner.Props, "side" | "align"> &
  FieldTextProps &
  Pick<
    Primitive.Trigger.Props,
    "aria-label" | "aria-describedby" | "aria-invalid"
  > & {
    options: readonly SelectOption<Value>[]
    placeholder?: ReactNode
    className?: string
  }

export function Select<Value extends string | number>({
  options,
  id,
  label,
  helperText,
  error,
  placeholder = "Select an option",
  className,
  side = "bottom",
  align = "start",
  disabled,
  modal = false,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: SelectProps<Value>) {
  const history = useOverlayHistoryProps(props)

  return (
    <Primitive.Root<Value>
      {...props}
      {...history}
      id={id}
      modal={modal}
      items={options}
      disabled={disabled || options.length === 0}
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
          <Primitive.Trigger
            {...fieldProps}
            className="ui-text-field-control ui-select-trigger"
            aria-label={ariaLabel}
          >
            <Primitive.Value
              data-slot="select-value"
              className="min-w-0 truncate"
              placeholder={placeholder}
            />
            <Primitive.Icon className="ui-select-icon">
              <ChevronDown className="size-4" aria-hidden />
            </Primitive.Icon>
          </Primitive.Trigger>
        )}
      </TextField>
      <Primitive.Portal>
        <Primitive.Positioner
          className="ui-floating-positioner"
          side={side}
          align={align}
          sideOffset={6}
          alignItemWithTrigger={false}
          collisionPadding={8}
          collisionAvoidance={{
            side: "flip",
            align: "shift",
            fallbackAxisSide: "end",
          }}
        >
          <Primitive.Popup className="ui-floating-panel ui-select-popup">
            <Primitive.List className="ui-select-list">
              {options.map((option) => (
                <Primitive.Item
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  disabled={option.disabled}
                  className="ui-menu-item ui-pressable relative justify-between"
                  render={renderSelectOption}
                >
                  <div data-press-content="">
                    <Primitive.ItemText>{option.label}</Primitive.ItemText>
                    <span className="size-4 shrink-0" aria-hidden="true">
                      <Primitive.ItemIndicator>
                        <Check className="size-4" />
                      </Primitive.ItemIndicator>
                    </span>
                  </div>
                </Primitive.Item>
              ))}
            </Primitive.List>
          </Primitive.Popup>
        </Primitive.Positioner>
      </Primitive.Portal>
    </Primitive.Root>
  )
}
