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
import { ChevronRight, AlertCircle } from "lucide-react"
import type { Course, GradingSystem } from "@/lib/types"
import { calculateCourseResult } from "@/lib/calculations"
import { cn } from "@/lib/utils"

interface CoursesTableProps {
  courses: Course[]
  gradingSystem: GradingSystem
}

export function CoursesTable({ courses, gradingSystem }: CoursesTableProps) {
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
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <p className="text-muted-foreground">No courses added yet</p>
        <p className="text-sm text-muted-foreground">Add your first course to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden rounded-lg border border-border overflow-hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Course Code</TableHead>
              <TableHead>Course Title</TableHead>
              <TableHead className="text-center">Credit</TableHead>
              <TableHead>Calculation Mode</TableHead>
              <TableHead className="text-center">Final Marks / Demo Grade</TableHead>
              <TableHead className="text-center">Letter Grade</TableHead>
              <TableHead className="text-center">Grade Point</TableHead>
              <TableHead className="text-center">Weighted Grade Point</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => {
              const result = calculateCourseResult(course, gradingSystem)
              const modeLabel = result.isDemoGrade ? "Use Demo Grade" : "Calculate from Marks"
              const finalValue = result.isDemoGrade ? "Manual Demo Grade" : `${result.percentage.toFixed(1)}%`
              
              return (
                <TableRow key={course.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-primary">{course.code}</TableCell>
                  <TableCell className="max-w-[180px] truncate">{course.title}</TableCell>
                  <TableCell className="text-center">{course.credit}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm">{modeLabel}</span>
                        {result.isDemoGrade && <Badge variant="outline">Demo Grade Used</Badge>}
                      </div>
                      {!result.isValidForCGPA && result.statusMessage && (
                        <span className="inline-flex items-start gap-1 text-xs text-warning-foreground">
                          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                          {result.statusMessage}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{finalValue}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn("text-xs", getGradeColor(result.letterGrade))}>
                      {result.letterGrade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{result.gradePoint.toFixed(2)}</TableCell>
                  <TableCell className="text-center font-medium">
                    {result.isValidForCGPA ? result.weightedGradePoint.toFixed(2) : "Not included"}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/courses/${course.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {courses.map((course) => {
          const result = calculateCourseResult(course, gradingSystem)
          const finalValue = result.isDemoGrade ? "Manual Demo Grade" : `${result.percentage.toFixed(1)}%`
          
          return (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="transition-colors hover:bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">{course.code}</span>
                        <Badge className={cn("text-xs", getGradeColor(result.letterGrade))}>
                          {result.letterGrade}
                        </Badge>
                      </div>
                      <p className="truncate text-sm font-medium text-foreground">{course.title}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{course.credit} credits</span>
                        <span>{result.isDemoGrade ? "Use Demo Grade" : "Calculate from Marks"}</span>
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
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </>
  )
}
