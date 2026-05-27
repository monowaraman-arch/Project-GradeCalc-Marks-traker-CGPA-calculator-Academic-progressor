"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { GraduationCap, LayoutDashboard, BookOpen, Settings, Database, Menu, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Report", href: "/report", icon: FileText },
  { name: "Grading", href: "/grading", icon: Settings },
  { name: "Data", href: "/data", icon: Database },
]

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="app-container flex h-14 items-center justify-between sm:h-16">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 sm:h-9 sm:w-9">
            <GraduationCap className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
          </div>
          <span className="font-brand-script text-4xl leading-none text-foreground transition-colors group-hover:text-primary sm:text-3xl">
            GradeCalc
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 sm:flex">
          <nav className="motion-stagger-nav flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-2 overflow-hidden rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <GraduationCap className="h-4 w-4 text-primary-foreground" />
                  </div>
                  GradeCalc
                </SheetTitle>
              </SheetHeader>
              <nav className="motion-stagger-left mt-6 flex flex-col gap-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-1",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
