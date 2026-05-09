"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, Trash2, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarksEntry } from "@/components/marks-entry"
import { CourseForm } from "@/components/course-form"
import { ComponentForm } from "@/components/component-form"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useApp } from "@/components/app-provider"
import { 
  calculateCourseResult, 
  calculateComponentScore, 
  validateComponentWeights,
  validateCourseCompleteness 
} from "@/lib/calculations"
import type { CourseComponent, ComponentItem } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  
  const {
    data,
    isLoading,
    getCourse,
    updateCourse,
    deleteCourse,
    addComponent,
    updateComponent,
    deleteComponent,
    addItem,
    updateItem,
    deleteItem
  } = useApp()

  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showComponentForm, setShowComponentForm] = useState(false)
  const [editingComponent, setEditingComponent] = useState<CourseComponent | null>(null)
  const [deleteComponentTarget, setDeleteComponentTarget] = useState<string | null>(null)
  const [showDeleteCourse, setShowDeleteCourse] = useState(false)

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const course = getCourse(courseId)

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <h3 className="text-lg font-semibold text-foreground">Course not found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The course you are looking for does not exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    )
  }

  const result = calculateCourseResult(course, data.gradingSystem)
  const weightValidation = validateComponentWeights(course.components)
  const completeness = validateCourseCompleteness(course)

  const getGradeColor = (letterGrade: string) => {
    if (letterGrade === "Not Set") return "bg-muted text-muted-foreground"
    if (letterGrade.startsWith("A")) return "bg-accent text-accent-foreground"
    if (letterGrade.startsWith("B")) return "bg-primary text-primary-foreground"
    if (letterGrade.startsWith("C")) return "bg-warning text-warning-foreground"
    if (letterGrade === "D") return "bg-muted text-muted-foreground"
    return "bg-destructive text-destructive-foreground"
  }

  const handleUpdateCourse = (updates: Parameters<typeof updateCourse>[1]) => {
    updateCourse(courseId, updates)
  }

  const handleAddComponent = (component: Omit<CourseComponent, "id">) => {
    addComponent(courseId, component)
  }

  const handleEditComponent = (component: CourseComponent) => {
    setEditingComponent(component)
  }

  const handleUpdateComponent = (component: Omit<CourseComponent, "id">) => {
    if (editingComponent) {
      updateComponent(courseId, editingComponent.id, component)
      setEditingComponent(null)
    }
  }

  const handleDeleteComponent = () => {
    if (deleteComponentTarget) {
      deleteComponent(courseId, deleteComponentTarget)
      setDeleteComponentTarget(null)
    }
  }

  const handleDeleteCourse = () => {
    deleteCourse(courseId)
    router.push("/courses")
  }

  const handleUpdateItem = (componentId: string, itemId: string, updates: Partial<ComponentItem>) => {
    updateItem(courseId, componentId, itemId, updates)
  }

  const handleDeleteItem = (componentId: string, itemId: string) => {
    deleteItem(courseId, componentId, itemId)
  }

  const handleAddItem = (componentId: string, item: Omit<ComponentItem, "id">) => {
    addItem(courseId, componentId, item)
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:space-y-8 sm:py-8">
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost" className="w-fit -ml-2">
          <Link href="/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </Button>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <p className="text-sm font-medium text-primary">{course.code}</p>
              <Badge className={cn(getGradeColor(result.letterGrade))}>
                {result.letterGrade}
              </Badge>
              {result.isDemoGrade && <Badge variant="outline">Demo Grade Used</Badge>}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{course.title}</h1>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
              <span>{course.credit} credits</span>
              {course.semester && <span>| {course.semester}</span>}
              {course.facultyName && <span>| {course.facultyName}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCourseForm(true)} className="flex-1 sm:flex-none">
              <Pencil className="mr-2 h-4 w-4" />
              <span className="sm:inline">Edit</span>
            </Button>
            <Button variant="outline" className="flex-1 text-destructive sm:flex-none" onClick={() => setShowDeleteCourse(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span className="sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Course Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <div className="text-center">
              <p className={cn("font-bold text-foreground", result.isDemoGrade ? "text-base sm:text-lg" : "text-2xl sm:text-3xl")}>
                {result.isDemoGrade ? "Manual Demo Grade" : `${result.percentage.toFixed(1)}%`}
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">Final Marks / Demo Grade</p>
            </div>
            <div className="text-center">
              <Badge className={cn("text-base px-3 py-1 sm:text-lg sm:px-4", getGradeColor(result.letterGrade))}>
                {result.letterGrade}
              </Badge>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">Letter Grade</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground sm:text-3xl">{result.gradePoint.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground sm:text-sm">Grade Point</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground sm:text-3xl">
                {result.isValidForCGPA ? result.weightedGradePoint.toFixed(2) : "--"}
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">Weighted Grade Point</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {result.statusMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-warning bg-warning/10 p-3 sm:p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-warning-foreground" />
          <div>
            <p className="font-medium text-warning-foreground text-sm sm:text-base">Not included in CGPA yet</p>
            <p className="text-xs text-warning-foreground/80 sm:text-sm">{result.statusMessage}</p>
          </div>
        </div>
      )}

      {result.isDemoGrade && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-4">
          <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
          <div>
            <p className="font-medium text-foreground text-sm sm:text-base">Demo grade mode is active</p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Stored marks remain saved, but this course uses the selected demo grade for Current Semester CGPA and All-Time CGPA.
            </p>
          </div>
        </div>
      )}

      {!result.isDemoGrade && !weightValidation.isValid && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive bg-destructive/10 p-3 sm:p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-destructive" />
          <div>
            <p className="font-medium text-destructive text-sm sm:text-base">Component weights do not add up to 100%</p>
            <p className="text-xs text-destructive/80 sm:text-sm">
              Current total: {weightValidation.total.toFixed(1)}% ({weightValidation.difference > 0 ? "need " + weightValidation.difference.toFixed(1) + "% more" : "excess " + Math.abs(weightValidation.difference).toFixed(1) + "%"})
            </p>
          </div>
        </div>
      )}

      {!result.isDemoGrade && !completeness.isComplete && completeness.missingMarksCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-warning bg-warning/10 p-3 sm:p-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-warning-foreground" />
          <div>
            <p className="font-medium text-warning-foreground text-sm sm:text-base">
              {completeness.missingMarksCount} mark{completeness.missingMarksCount > 1 ? "s" : ""} not entered
            </p>
            <p className="text-xs text-warning-foreground/80 sm:text-sm">
              {completeness.componentIssues
                .filter(c => c.missingItems > 0)
                .map(c => `${c.componentName}: ${c.missingItems}`)
                .join(", ")}
            </p>
          </div>
        </div>
      )}

      {!result.isDemoGrade && completeness.invalidMarksCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive bg-destructive/10 p-3 sm:p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-destructive" />
          <div>
            <p className="font-medium text-destructive text-sm sm:text-base">
              {completeness.invalidMarksCount} invalid mark{completeness.invalidMarksCount > 1 ? "s" : ""} detected
            </p>
            <p className="text-xs text-destructive/80 sm:text-sm">
              Some marks exceed total or are negative
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              {result.isDemoGrade ? "Stored Mark Distribution" : "Mark Distribution"}
            </h2>
            {result.isDemoGrade && (
              <p className="text-xs text-muted-foreground sm:text-sm">These marks are saved but not used while Demo Grade mode is active.</p>
            )}
          </div>
          <Button onClick={() => setShowComponentForm(true)} size="sm" className="sm:size-default">
            <Plus className="mr-1 h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add </span>Component
          </Button>
        </div>

        {course.components.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center sm:py-12">
            <p className="text-muted-foreground text-sm sm:text-base">No components added yet</p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Add components like Quiz, Midterm, Final, etc.
            </p>
            <Button className="mt-4" onClick={() => setShowComponentForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Component
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {course.components.map((component) => (
              <MarksEntry
                key={component.id}
                component={component}
                onUpdateItem={(itemId, updates) => handleUpdateItem(component.id, itemId, updates)}
                onDeleteItem={(itemId) => handleDeleteItem(component.id, itemId)}
                onAddItem={(item) => handleAddItem(component.id, item)}
                onDeleteComponent={() => setDeleteComponentTarget(component.id)}
                onEditComponent={() => handleEditComponent(component)}
              />
            ))}
          </div>
        )}
      </div>

      {!result.isDemoGrade && course.components.length > 0 && (
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {course.components.map((component) => {
                const compResult = calculateComponentScore(component)
                const percentage = compResult.componentPercentage
                return (
                  <div key={component.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{component.name}</p>
                        <p className="text-xs text-muted-foreground">{component.weight}% weight</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium text-foreground">
                          {compResult.weightedScore.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          of {component.weight}%
                        </p>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-full transition-all",
                          percentage >= 80 ? "bg-accent" :
                          percentage >= 60 ? "bg-primary" :
                          percentage >= 40 ? "bg-warning" :
                          "bg-destructive"
                        )}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    {compResult.missingItems > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {compResult.missingItems} of {compResult.totalItems} items not entered
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="font-medium text-foreground">Total</span>
              <div className="text-right">
                <span className="text-lg font-bold text-foreground">{result.percentage.toFixed(1)}%</span>
                <span className="text-muted-foreground"> / 100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {course.components.length > 0 && (
        <Card className="border-muted">
          <CardContent className="p-3 sm:p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="space-y-1 text-xs text-muted-foreground sm:text-sm">
                <p className="font-medium text-foreground">How scores are calculated</p>
                {result.isDemoGrade ? (
                  <p>Demo Grade mode uses the selected letter grade and its Grade Point directly. Stored marks are kept for later.</p>
                ) : (
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Each component calculates its own percentage based on the selected rule</li>
                    <li>The weighted score = component percentage x component weight / 100</li>
                    <li>Final grade = sum of all weighted scores, matched to grading scale</li>
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <CourseForm
        open={showCourseForm}
        onOpenChange={setShowCourseForm}
        onSubmit={handleUpdateCourse}
        initialData={course}
        gradingSystem={data.gradingSystem}
        mode="edit"
      />

      <ComponentForm
        open={showComponentForm || editingComponent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowComponentForm(false)
            setEditingComponent(null)
          }
        }}
        onSubmit={editingComponent ? handleUpdateComponent : handleAddComponent}
        initialData={editingComponent ?? undefined}
        mode={editingComponent ? "edit" : "create"}
        currentTotalWeight={course.components
          .filter(c => editingComponent ? c.id !== editingComponent.id : true)
          .reduce((sum, c) => sum + c.weight, 0)}
      />

      <ConfirmDialog
        open={deleteComponentTarget !== null}
        onOpenChange={(open) => !open && setDeleteComponentTarget(null)}
        onConfirm={handleDeleteComponent}
        title="Delete Component"
        description="Are you sure you want to delete this component? All marks will be removed."
        confirmText="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        open={showDeleteCourse}
        onOpenChange={setShowDeleteCourse}
        onConfirm={handleDeleteCourse}
        title="Delete Course"
        description="Are you sure you want to delete this course? All components and marks will be permanently removed."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
