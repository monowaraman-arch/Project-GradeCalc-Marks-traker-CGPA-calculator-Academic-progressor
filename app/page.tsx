"use client"

import { useState } from "react"
import { BookOpen, GraduationCap, Award, TrendingUp, Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatCard } from "@/components/stat-card"
import { CoursesTable } from "@/components/courses-table"
import { CourseForm } from "@/components/course-form"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useApp } from "@/components/app-provider"
import {
  calculateCGPA,
  calculateCourseResult,
  calculateCurrentSemesterCGPA,
  calculateCurrentSemesterCredits,
} from "@/lib/calculations"
import type { Course } from "@/lib/types"

export default function Dashboard() {
  const { data, isLoading, addCourse, deleteCourse, updateCGPASettings } = useApp()
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [prevCGPA, setPrevCGPA] = useState("")
  const [prevCredits, setPrevCredits] = useState("")

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const currentSemesterCGPA = calculateCurrentSemesterCGPA(data.courses, data.gradingSystem)
  const allTimeCGPA = calculateCGPA(data.courses, data.gradingSystem, data.cgpaSettings)
  const totalCredits = data.courses.reduce((sum, course) => sum + course.credit, 0)
  const countedCredits = calculateCurrentSemesterCredits(data.courses, data.gradingSystem)
  const courseResults = data.courses.map(course => ({
    course,
    result: calculateCourseResult(course, data.gradingSystem)
  }))
  const coursesNotIncluded = courseResults.filter(({ result }) => !result.isValidForCGPA)
  const marksIssues = coursesNotIncluded.filter(({ result }) => !result.isDemoGrade).length
  const demoIssues = coursesNotIncluded.filter(({ result }) => result.isDemoGrade).length

  const handleAddCourse = (course: Omit<Course, "id" | "createdAt" | "updatedAt">) => {
    addCourse(course)
  }

  const handleDeleteCourse = () => {
    if (deleteTarget) {
      deleteCourse(deleteTarget)
      setDeleteTarget(null)
    }
  }

  const handleUpdateCGPASettings = () => {
    updateCGPASettings({
      previousCGPA: prevCGPA ? parseFloat(prevCGPA) : null,
      previousCredits: prevCredits ? parseFloat(prevCredits) : null
    })
  }

  const deleteCourseCode = data.courses.find((course) => course.id === deleteTarget)?.code

  return (
    <div className="app-container space-y-6 py-6 sm:space-y-8 sm:py-8">
      <div className="motion-section flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Track your academic performance</p>
        </div>
        <Button onClick={() => setShowCourseForm(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {coursesNotIncluded.length > 0 && (
        <div className="motion-section motion-delay-1 flex items-start gap-3 rounded-lg border border-warning bg-warning/10 p-3 sm:p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-warning-foreground" />
          <div className="space-y-1">
            <p className="font-medium text-warning-foreground text-sm sm:text-base">Attention needed</p>
            <ul className="text-xs text-warning-foreground/80 sm:text-sm space-y-0.5">
              <li>{coursesNotIncluded.length} course(s) are not included in CGPA yet</li>
              {marksIssues > 0 && <li>{marksIssues} marks-based course(s) need complete valid marks and 100% component weight</li>}
              {demoIssues > 0 && <li>{demoIssues} demo-grade course(s) need a selected grade that exists in the grading system</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="motion-stagger grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Courses"
          value={data.courses.length}
          subtitle="This semester"
          icon={BookOpen}
          variant="default"
        />
        <StatCard
          title="Current Semester CGPA"
          value={currentSemesterCGPA.toFixed(2)}
          subtitle={`${countedCredits} credits counted`}
          icon={TrendingUp}
          variant="primary"
        />
        <StatCard
          title="All-Time CGPA"
          value={allTimeCGPA.toFixed(2)}
          subtitle={data.cgpaSettings.previousCredits ? "Including previous record" : "Current semester only"}
          icon={Award}
          variant="accent"
        />
        <StatCard
          title="Total Credits"
          value={totalCredits}
          subtitle="Credit hours"
          icon={GraduationCap}
          variant="muted"
        />
      </div>

      <Card className="motion-section motion-delay-2">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">CGPA Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:flex sm:gap-4">
              <div className="min-w-0 space-y-1.5 sm:space-y-2">
                <Label htmlFor="prevCGPA" className="text-xs sm:text-sm">Previous CGPA</Label>
                <Input
                  id="prevCGPA"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  placeholder={data.cgpaSettings.previousCGPA?.toString() ?? "Not set"}
                  value={prevCGPA}
                  onChange={(e) => setPrevCGPA(e.target.value)}
                  className="h-9 sm:w-32"
                />
              </div>
              <div className="min-w-0 space-y-1.5 sm:space-y-2">
                <Label htmlFor="prevCredits" className="text-xs sm:text-sm">Previous Completed Credits</Label>
                <Input
                  id="prevCredits"
                  type="number"
                  min="0"
                  placeholder={data.cgpaSettings.previousCredits?.toString() ?? "Not set"}
                  value={prevCredits}
                  onChange={(e) => setPrevCredits(e.target.value)}
                  className="h-9 sm:w-32"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateCGPASettings} variant="outline" size="sm" className="flex-1 sm:flex-none sm:size-default">
                Update
              </Button>
              {data.cgpaSettings.previousCGPA !== null && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-none sm:size-default"
                  onClick={() => {
                    updateCGPASettings({ previousCGPA: null, previousCredits: null })
                    setPrevCGPA("")
                    setPrevCredits("")
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          {data.cgpaSettings.previousCGPA !== null && (
            <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
              Previous: {data.cgpaSettings.previousCGPA?.toFixed(2)} CGPA with {data.cgpaSettings.previousCredits} completed credits
            </p>
          )}
        </CardContent>
      </Card>

      <div className="motion-section motion-delay-3 space-y-3 sm:space-y-4">
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">Course Summary</h2>
        <CoursesTable
          courses={data.courses}
          gradingSystem={data.gradingSystem}
          onDeleteCourse={setDeleteTarget}
        />
      </div>

      <CourseForm
        open={showCourseForm}
        onOpenChange={setShowCourseForm}
        onSubmit={handleAddCourse}
        gradingSystem={data.gradingSystem}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteCourse}
        title="Delete Course"
        description={`Are you sure you want to delete ${deleteCourseCode ?? "this course"}? All marks and components will be permanently removed.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
