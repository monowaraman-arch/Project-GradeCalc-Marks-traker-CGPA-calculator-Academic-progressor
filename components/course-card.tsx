"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Trash2, AlertCircle } from "lucide-react"
import type { Course } from "@/lib/types"
import type { GradingSystem } from "@/lib/types"
import { calculateCourseResult } from "@/lib/calculations"
import { cn } from "@/lib/utils"

interface CourseCardProps {
  course: Course
  gradingSystem: GradingSystem
  onDelete?: () => void
}

export function CourseCard({ course, gradingSystem, onDelete }: CourseCardProps) {
  const result = calculateCourseResult(course, gradingSystem)
  
  const getGradeColor = (letterGrade: string) => {
    if (letterGrade === "Not Set") return "bg-muted text-muted-foreground"
    if (letterGrade.startsWith("A")) return "bg-accent text-accent-foreground"
    if (letterGrade.startsWith("B")) return "bg-primary text-primary-foreground"
    if (letterGrade.startsWith("C")) return "bg-warning text-warning-foreground"
    if (letterGrade === "D") return "bg-muted text-muted-foreground"
    return "bg-destructive text-destructive-foreground"
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">{course.code}</p>
            <h3 className="font-semibold text-foreground leading-tight">{course.title}</h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={cn("ml-2", getGradeColor(result.letterGrade))}>
              {result.letterGrade}
            </Badge>
            {result.isDemoGrade && <Badge variant="outline">Demo Grade Used</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-foreground sm:text-2xl">
              {result.isDemoGrade ? result.letterGrade : `${result.percentage.toFixed(1)}%`}
            </p>
            <p className="text-xs text-muted-foreground">{result.isDemoGrade ? "Demo Grade" : "Score"}</p>
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
        
        {(course.facultyName || course.semester) && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {course.semester && <span>{course.semester}</span>}
            {course.facultyName && course.semester && <span>-</span>}
            {course.facultyName && <span>{course.facultyName}</span>}
          </div>
        )}
        
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button asChild variant="ghost" size="sm" className="flex-1">
            <Link href={`/courses/${course.id}`}>
              View Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                onDelete()
              }}
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
