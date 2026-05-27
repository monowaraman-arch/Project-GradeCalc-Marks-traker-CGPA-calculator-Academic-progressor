"use client"

import type { KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, AlertCircle } from "lucide-react"
import type { Course } from "@/lib/types"
import type { GradingSystem } from "@/lib/types"
import { calculateCourseResult } from "@/lib/calculations"

interface CourseCardProps {
  course: Course
  gradingSystem: GradingSystem
  onDelete?: () => void
}

export function CourseCard({ course, gradingSystem, onDelete }: CourseCardProps) {
  const router = useRouter()
  const result = calculateCourseResult(course, gradingSystem)
  const coursePath = `/courses/${course.id}`

  const openCourse = () => {
    router.push(coursePath)
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLElement && event.target.closest("button")) {
      return
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openCourse()
    }
  }

  return (
    <Card
      role="link"
      tabIndex={0}
      onClick={openCourse}
      onKeyDown={handleCardKeyDown}
      className="motion-card group relative cursor-pointer overflow-hidden transition-all hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-base font-medium text-primary">{course.code}</p>
            <h3 className="text-lg font-semibold leading-tight text-foreground sm:text-xl">{course.title}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex justify-center">
            <div className="inline-flex min-w-[7rem] flex-col items-center rounded-md bg-emerald-600 px-3 py-2 text-white shadow-sm">
              <p className="text-xl font-bold leading-tight sm:text-2xl">
                {result.isDemoGrade ? result.letterGrade : `${result.percentage.toFixed(1)}%`}
              </p>
              <p className="whitespace-nowrap text-xs font-medium text-white/90">{result.isDemoGrade ? "Demo Grade" : "Score"}</p>
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground sm:text-2xl">{result.gradePoint.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Grade Point</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground sm:text-2xl">{course.credit}</p>
            <p className="text-xs text-muted-foreground">Credits</p>
          </div>
        </div>

        {!result.isValidForCGPA && result.statusMessage && (
          <div className="flex items-start gap-2 rounded-md bg-warning/10 p-2 text-xs text-warning-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{result.statusMessage}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex min-w-0 flex-wrap gap-2 text-xs text-muted-foreground">
            {course.semester && <span>{course.semester}</span>}
            {course.facultyName && course.semester && <span>-</span>}
            {course.facultyName && <span className="truncate">{course.facultyName}</span>}
          </div>
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete()
              }}
              aria-label={`Delete ${course.code}`}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
