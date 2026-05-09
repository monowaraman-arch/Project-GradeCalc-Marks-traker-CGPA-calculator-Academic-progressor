"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course-card"
import { CourseForm } from "@/components/course-form"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useApp } from "@/components/app-provider"
import type { Course } from "@/lib/types"

export default function CoursesPage() {
  const { data, isLoading, addCourse, deleteCourse } = useApp()
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const handleAddCourse = (course: Omit<Course, "id" | "createdAt" | "updatedAt">) => {
    addCourse(course)
  }

  const handleDeleteCourse = () => {
    if (deleteTarget) {
      deleteCourse(deleteTarget)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Courses</h1>
          <p className="text-muted-foreground">Manage your courses and marks</p>
        </div>
        <Button onClick={() => setShowCourseForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {data.courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-foreground">No courses yet</h3>
            <p className="text-sm text-muted-foreground">
              Add your first course to start tracking your grades. You can customize
              the mark distribution for each course.
            </p>
            <Button onClick={() => setShowCourseForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Course
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              gradingSystem={data.gradingSystem}
              onDelete={() => setDeleteTarget(course.id)}
            />
          ))}
        </div>
      )}

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
        description="Are you sure you want to delete this course? All marks and components will be permanently removed."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
