"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@workspace/ui/components/button"

export function LoadingExample() {
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <>
      <Button
        loading={loading}
        onClick={() => {
          setLoading(true)
          timer.current = setTimeout(() => setLoading(false), 2400)
        }}
      >
        Save changes
      </Button>
      <span role="status" className="sr-only">
        {loading ? "Saving changes" : ""}
      </span>
    </>
  )
}
