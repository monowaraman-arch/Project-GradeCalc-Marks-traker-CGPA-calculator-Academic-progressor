"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Trash2 } from "lucide-react"
import type { Course, GradingSystem } from "@/lib/types"
import { calculateCourseResult } from "@/lib/calculations"
import { cn } from "@/lib/utils"

interface CoursesTableProps {
  courses: Course[]
  gradingSystem: GradingSystem
  onDeleteCourse?: (courseId: string) => void
}

export function CoursesTable({ courses, gradingSystem, onDeleteCourse }: CoursesTableProps) {
  const getGradeColor = (letterGrade: string) => {
    if (letterGrade === "Not Set") return "bg-muted text-muted-foreground"
    if (letterGrade.startsWith("A")) return "bg-accent text-accent-foreground"
    if (letterGrade.startsWith("B")) return "bg-primary text-primary-foreground"
    if (letterGrade.startsWith("C")) return "bg-warning text-warning-foreground"
    if (letterGrade === "D") return "bg-muted text-muted-foreground"
    return "bg-destructive text-destructive-foreground"
  }

  if (courses.length === 0) {
    return (
      <div className="motion-section flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <p className="text-muted-foreground">No courses added yet</p>
        <p className="text-sm text-muted-foreground">Add your first course to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="motion-section hidden rounded-lg border border-border overflow-hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Course Code</TableHead>
              <TableHead>Course Title</TableHead>
              <TableHead className="text-center">Credit</TableHead>
              <TableHead className="text-center">Final Marks / Demo Grade</TableHead>
              <TableHead className="text-center">Letter Grade</TableHead>
              <TableHead className="text-center">Grade Point</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="motion-stagger-left">
            {courses.map((course) => {
              const result = calculateCourseResult(course, gradingSystem)
              const finalValue = result.isDemoGrade ? "Manual Demo Grade" : `${result.percentage.toFixed(1)}%`
              
              return (
                <TableRow key={course.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <Link
                      href={`/courses/${course.id}`}
                      className="text-primary transition-colors hover:text-primary/80 hover:underline"
                    >
                      {course.code}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">{course.title}</TableCell>
                  <TableCell className="text-center">{course.credit}</TableCell>
                  <TableCell className="text-center">{finalValue}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn("text-xs", getGradeColor(result.letterGrade))}>
                      {result.letterGrade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{result.gradePoint.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {onDeleteCourse && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteCourse(course.id)}
                        aria-label={`Delete ${course.code}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="motion-stagger-left space-y-3 md:hidden">
        {courses.map((course) => {
          const result = calculateCourseResult(course, gradingSystem)
          const finalValue = result.isDemoGrade ? "Manual Demo Grade" : `${result.percentage.toFixed(1)}%`
          
          return (
            <Card key={course.id} className="motion-card transition-colors hover:bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/courses/${course.id}`}
                        className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                      >
                        {course.code}
                      </Link>
                      <Badge className={cn("text-xs", getGradeColor(result.letterGrade))}>
                        {result.letterGrade}
                      </Badge>
                    </div>
                    <Link
                      href={`/courses/${course.id}`}
                      className="block truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {course.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{course.credit} credits</span>
                      <span>{finalValue}</span>
                      <span>Grade Point: {result.gradePoint.toFixed(2)}</span>
                    </div>
                    {result.isDemoGrade && <Badge variant="outline">Demo Grade Used</Badge>}
                    {!result.isValidForCGPA && result.statusMessage && (
                      <div className="flex items-start gap-1 text-xs text-warning-foreground">
                        <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>{result.statusMessage}</span>
                      </div>
                    )}
                  </div>
                  {onDeleteCourse && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteCourse(course.id)}
                      aria-label={`Delete ${course.code}`}
                      className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
