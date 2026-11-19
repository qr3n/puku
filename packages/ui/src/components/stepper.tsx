import { cn } from "@workspace/ui/lib/utils"

type StepperProps = {
  steps: readonly string[]
  currentStep: number
  label: string
  className?: string
}

export function Stepper({
  steps,
  currentStep,
  label,
  className,
}: StepperProps) {
  return (
    <ol
      aria-label={label}
      className={cn("flex items-center gap-1.5", className)}
    >
      {steps.map((step, index) => (
        <li
          key={index}
          aria-current={index === currentStep ? "step" : undefined}
        >
          <span className="sr-only">{step}</span>
          <span
            aria-hidden
            className={cn(
              "block h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none",
              index === currentStep
                ? "w-6 bg-foreground"
                : "w-1.5 bg-progress-track"
            )}
          />
        </li>
      ))}
    </ol>
  )
}
