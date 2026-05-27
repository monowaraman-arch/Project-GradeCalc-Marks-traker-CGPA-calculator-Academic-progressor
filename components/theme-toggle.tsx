"use client"

import { useEffect, useState, type MouseEvent } from "react"
import { flushSync } from "react-dom"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>
  }
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const nextTheme = isDark ? "light" : "dark"

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    if (!mounted) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const doc = document as ViewTransitionDocument

    if (!doc.startViewTransition || prefersReducedMotion) {
      setTheme(nextTheme)
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme)
      })
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "cubic-bezier(.76,.32,.29,.99)",
          pseudoElement: "::view-transition-new(root)",
        } as KeyframeAnimationOptions
      )
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${nextTheme} mode`}
      onClick={handleToggle}
      className="group relative overflow-hidden"
    >
      <Sun className="absolute h-4 w-4 scale-100 rotate-0 opacity-100 transition-all duration-300 group-hover:scale-110 dark:scale-75 dark:-rotate-90 dark:opacity-0" />
      <Moon className="absolute h-4 w-4 scale-75 rotate-90 opacity-0 transition-all duration-300 group-hover:scale-110 dark:scale-100 dark:rotate-0 dark:opacity-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
