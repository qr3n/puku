import { Check, Mail, Plus } from "lucide-react"
import { Manrope } from "next/font/google"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import {
  OTPExample,
  OverlayExamples,
  StepperExample,
} from "./component-examples"
import {
  CheckboxExample,
  MenuExample,
  SearchableSelectExample,
  SelectExample,
  SwitchExample,
  ToastExample,
  TooltipExample,
} from "./interaction-examples"
import { LoadingExample } from "./loading-example"
import { LottieExample } from "./lottie-example"

const variants = [
  "default",
  "secondary",
  "tonal",
  "ghost",
  "destructive",
] as const
const sizes = ["xs", "sm", "default", "lg"] as const
const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const

const manrope = Manrope({
  variable: "--font-ui-heading",
  preload: false,
})

export default function UIPage() {
  return (
    <main id="catalog" className="mx-auto flex max-w-3xl flex-col gap-8 p-6">
      <h1 className="text-3xl font-semibold">Button</h1>
      <section
        className="flex flex-wrap gap-3"
        lang="ru"
        aria-label="Пример кнопок"
      >
        <Button>Выйти</Button>
        <Button variant="tonal">Остаться</Button>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Loading</h2>
        <div className="flex flex-wrap items-center gap-3">
          <LoadingExample />
        </div>
        <div className="flex flex-wrap gap-3">
          {variants.map((variant) => (
            <Button key={variant} variant={variant} loading>
              {variant}
            </Button>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Skeleton</h2>
        <div className="grid max-w-sm gap-4 rounded-2xl border p-4">
          <Skeleton className="aspect-video rounded-xl" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </section>
      <section id="lottie" className="space-y-3">
        <h2 className="text-lg font-medium">Lottie</h2>
        <LottieExample />
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Variants</h2>
        <div className="flex flex-wrap items-center gap-3">
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Sizes</h2>
        <div className="flex flex-wrap items-center gap-3">
          {sizes.map((size) => (
            <div key={size} className="grid justify-items-center gap-2">
              <Button size={size}>Continue</Button>
              <span className="text-sm text-muted-foreground">{size}</span>
            </div>
          ))}
          {iconSizes.map((size) => (
            <Button
              key={size}
              size={size}
              variant="tonal"
              aria-label={`Add item (${size})`}
            >
              <Plus aria-hidden />
            </Button>
          ))}
          <Button lang="ru" variant="tonal">
            Сохранить и продолжить настройку
          </Button>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Hover and press states</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Hover or press and hold</Button>
          <Button disabled>Unavailable</Button>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Input and Textarea</h2>
        <div className="grid max-w-sm gap-3">
          <Input
            label="Email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            leftIcon={<Mail className="size-5" />}
          />
          <Input
            label="Пароль"
            type="password"
            autoComplete="new-password"
            size="lg"
            lang="ru"
            helperText="Не менее 8 символов."
          />
          <Textarea label="Message" placeholder="How can we help?" />
          <Textarea
            label="Description"
            error="Enter at least 10 characters."
            defaultValue="Hello"
          />
        </div>
      </section>
      <section id="otp-input" className="space-y-3">
        <h2 className="text-lg font-medium">OTP input</h2>
        <OTPExample />
      </section>
      <section id="stepper" className="space-y-3">
        <h2 className="text-lg font-medium">Stepper</h2>
        <StepperExample />
      </section>
      <section id="overlays" className="space-y-3">
        <h2 className="text-lg font-medium">Overlays</h2>
        <OverlayExamples />
      </section>
      <section id="menu" className="space-y-3">
        <h2 className="text-lg font-medium">Menu</h2>
        <MenuExample />
      </section>
      <section id="tooltip" className="space-y-3">
        <h2 className="text-lg font-medium">Tooltip</h2>
        <TooltipExample />
      </section>
      <section id="checkbox" className="space-y-3">
        <h2 className="text-lg font-medium">Checkbox</h2>
        <CheckboxExample />
      </section>
      <section id="select" className="space-y-3">
        <h2 className="text-lg font-medium">Select</h2>
        <SelectExample />
      </section>
      <section id="searchable-select" className="space-y-3">
        <h2 className="text-lg font-medium">Searchable Select</h2>
        <SearchableSelectExample />
      </section>
      <section id="switch" className="space-y-3">
        <h2 className="text-lg font-medium">Switch</h2>
        <SwitchExample />
      </section>
      <section id="toast" className="space-y-3">
        <h2 className="text-lg font-medium">Toast</h2>
        <ToastExample />
      </section>
      <section id="badge" className="space-y-3">
        <h2 className="text-lg font-medium">Badge</h2>
        <ul className="flex flex-wrap items-center gap-2" lang="ru">
          <li>
            <Badge>Черновик</Badge>
          </li>
          <li>
            <Badge variant="success">
              <Check aria-hidden="true" /> Активен
            </Badge>
          </li>
          <li>
            <Badge variant="warning">На проверке</Badge>
          </li>
          <li>
            <Badge variant="error">Отклонён</Badge>
          </li>
        </ul>
      </section>
      <section id="typography" className="space-y-3">
        <h2 className="font-heading text-lg font-medium">Typography</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Onest", className: "" },
            { label: "Onest + Manrope", className: manrope.variable },
          ].map(({ label, className }) => (
            <div
              key={label}
              className={cn(
                "space-y-2 rounded-2xl border bg-card p-4 text-card-foreground",
                className
              )}
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <h3 lang="ru" className="font-heading text-3xl font-semibold">
                Настройки профиля
              </h3>
              <p lang="ru" className="text-sm">
                Управляйте личными данными и уведомлениями.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
