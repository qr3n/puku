"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Drawer } from "@base-ui/react/drawer"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { X } from "lucide-react"
import {
  resolveValue,
  toast,
  ToastBar,
  useToaster,
  type DefaultToastOptions,
  type Toast,
  type ToastPosition,
} from "react-hot-toast"

type UIProviderProps = {
  children: ReactNode
  toastPosition?: ToastPosition
}

const toastOptions: DefaultToastOptions = {
  success: {
    iconTheme: {
      primary: "var(--toast-success)",
      secondary: "var(--toast-status-foreground)",
    },
  },
  error: {
    iconTheme: {
      primary: "var(--toast-error)",
      secondary: "var(--toast-status-foreground)",
    },
  },
  loading: {
    iconTheme: {
      primary: "var(--foreground)",
      secondary: "var(--muted-foreground)",
    },
  },
}

export function UIProvider({
  children,
  toastPosition = "top-center",
}: UIProviderProps) {
  const page = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = page.current
    if (!element) return

    const syncScroll = () => {
      const offset = window.scrollY + document.body.scrollTop
      element.style.setProperty("--drawer-page-scroll", `${offset}px`)
    }
    const syncActive = () => {
      if (element.hasAttribute("data-active")) {
        syncScroll()
        // Non-modal drawers still allow the page to scroll.
        window.addEventListener("scroll", syncScroll, { passive: true })
      } else {
        window.removeEventListener("scroll", syncScroll)
      }
    }
    const observer = new MutationObserver(syncActive)
    observer.observe(element, { attributeFilter: ["data-active"] })
    syncActive()
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", syncScroll)
    }
  }, [])

  return (
    <Drawer.Provider>
      <Drawer.IndentBackground className="ui-drawer-indent-background" />
      <Drawer.Indent ref={page} className="ui-drawer-indent">
        {children}
      </Drawer.Indent>
      <ToastStack position={toastPosition} />
    </Drawer.Provider>
  )
}

function ToastStack({ position }: { position: ToastPosition }) {
  const { toasts, handlers } = useToaster(toastOptions)
  const { calculateOffset, updateHeight, startPause, endPause } = handlers
  const stack = useRef<HTMLDivElement>(null)
  const hovered = useRef(false)
  const paused = useRef(false)
  const [shouldPause, setShouldPause] = useState(false)
  const returnFocus = useRef<HTMLElement>(null)

  const syncPause = useCallback((focusedElement: EventTarget | null) => {
    const containsFocus =
      focusedElement instanceof Element &&
      stack.current?.contains(focusedElement) &&
      !focusedElement.closest("[inert]")
    setShouldPause(hovered.current || Boolean(containsFocus))
  }, [])

  useEffect(() => {
    if (paused.current === shouldPause) return

    paused.current = shouldPause
    if (shouldPause) startPause()
    else endPause()
  }, [shouldPause, startPause, endPause])

  useEffect(() => {
    // Dismissal can remove the focused element without a blur event.
    if (!toasts.some((notification) => notification.visible)) {
      hovered.current = false
    }
    syncPause(document.activeElement)
  }, [toasts, syncPause])

  const dismiss = (id: string, button: HTMLElement) => {
    if (document.activeElement === button && returnFocus.current?.isConnected) {
      returnFocus.current.focus({ preventScroll: true })
    }
    toast.dismiss(id)
  }

  return (
    <div
      ref={stack}
      data-rht-toaster=""
      className="ui-toast-stack"
      onMouseEnter={() => {
        hovered.current = true
        syncPause(document.activeElement)
      }}
      onMouseLeave={() => {
        hovered.current = false
        syncPause(document.activeElement)
      }}
      onFocus={(event) => {
        const previous = event.relatedTarget
        if (!event.currentTarget.contains(previous)) {
          returnFocus.current = previous instanceof HTMLElement ? previous : null
        }
        syncPause(event.target)
      }}
      onBlur={(event) => syncPause(event.relatedTarget)}
    >
      {toasts.map((notification) => (
        <ToastStackItem
          key={notification.id}
          notification={notification}
          position={notification.position ?? position}
          offset={calculateOffset(notification, { defaultPosition: position })}
          updateHeight={updateHeight}
          dismiss={dismiss}
        />
      ))}
    </div>
  )
}

function ToastStackItem({
  notification,
  position,
  offset,
  updateHeight,
  dismiss,
}: {
  notification: Toast
  position: ToastPosition
  offset: number
  updateHeight: (id: string, height: number) => void
  dismiss: (id: string, button: HTMLElement) => void
}) {
  const measure = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) return

      const measureHeight = () =>
        updateHeight(notification.id, element.offsetHeight)
      measureHeight()
      const observer = new ResizeObserver(measureHeight)
      observer.observe(element)
      return () => observer.disconnect()
    },
    [notification.id, updateHeight]
  )
  const top = position.startsWith("top")

  return (
    <div
      ref={measure}
      inert={!notification.visible}
      className="ui-toast-stack-item"
      data-position={position}
      style={{ transform: `translateY(${top ? offset : -offset}px)` }}
    >
      {notification.type === "custom" ? (
        resolveValue(notification.message, notification)
      ) : (
        <ToastBar
          toast={{
            ...notification,
            className: cn("ui-toast", notification.className),
          }}
          position={position}
        >
          {({ icon, message }) => (
            <>
              {icon && (
                <span aria-hidden="true" className="flex shrink-0">
                  {icon}
                </span>
              )}
              <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                {message}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-11 min-h-0 rounded-full"
                aria-label="Dismiss notification"
                disabled={!notification.visible}
                onClick={(event) => dismiss(notification.id, event.currentTarget)}
              >
                <X aria-hidden />
              </Button>
            </>
          )}
        </ToastBar>
      )}
    </div>
  )
}
