import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  variant?: "default" | "primary" | "accent" | "muted"
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden",
      variant === "primary" && "border-primary/20 bg-primary/5",
      variant === "accent" && "border-accent/20 bg-accent/5",
      variant === "muted" && "border-muted bg-muted/50"
    )}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
            <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">{title}</p>
            <p className={cn(
              "text-2xl font-bold tracking-tight sm:text-3xl",
              variant === "primary" && "text-primary",
              variant === "accent" && "text-accent",
              variant === "default" && "text-foreground"
            )}>
              {value}
            </p>
            {subtitle && (
              <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10",
            variant === "primary" && "bg-primary/10 text-primary",
            variant === "accent" && "bg-accent/10 text-accent",
            variant === "default" && "bg-secondary text-muted-foreground",
            variant === "muted" && "bg-muted text-muted-foreground"
          )}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
