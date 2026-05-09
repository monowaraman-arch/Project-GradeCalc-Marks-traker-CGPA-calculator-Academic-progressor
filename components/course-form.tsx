"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Course, CourseCalculationMode, GradingSystem } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CourseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (course: Omit<Course, "id" | "createdAt" | "updatedAt">) => void
  initialData?: Partial<Course>
  gradingSystem?: GradingSystem
  mode?: "create" | "edit"
}

export function CourseForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData,
  gradingSystem,
  mode = "create" 
}: CourseFormProps) {
  const [code, setCode] = useState(initialData?.code ?? "")
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [credit, setCredit] = useState(initialData?.credit?.toString() ?? "3")
  const [facultyName, setFacultyName] = useState(initialData?.facultyName ?? "")
  const [semester, setSemester] = useState(initialData?.semester ?? "")
  const [calculationMode, setCalculationMode] = useState<CourseCalculationMode>(initialData?.calculationMode ?? "marks")
  const [demoLetterGrade, setDemoLetterGrade] = useState(initialData?.demoLetterGrade ?? "")

  const gradeRules = useMemo(() => {
    return [...(gradingSystem?.rules ?? [])].sort((a, b) => b.minPercentage - a.minPercentage)
  }, [gradingSystem])

  const selectedDemoRule = gradeRules.find(
    rule => rule.letterGrade.trim().toLowerCase() === demoLetterGrade.trim().toLowerCase()
  )

  useEffect(() => {
    if (!open) return

    setCode(initialData?.code ?? "")
    setTitle(initialData?.title ?? "")
    setCredit(initialData?.credit?.toString() ?? "3")
    setFacultyName(initialData?.facultyName ?? "")
    setSemester(initialData?.semester ?? "")
    setCalculationMode(initialData?.calculationMode ?? "marks")
    setDemoLetterGrade(initialData?.demoLetterGrade ?? "")
  }, [open, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onSubmit({
      code: code.trim(),
      title: title.trim(),
      credit: parseFloat(credit) || 3,
      facultyName: facultyName.trim() || undefined,
      semester: semester.trim() || undefined,
      calculationMode,
      demoLetterGrade: demoLetterGrade.trim() || null,
      demoGradePoint: selectedDemoRule?.gradePoint ?? null,
      components: initialData?.components ?? []
    })
    
    if (mode === "create") {
      setCode("")
      setTitle("")
      setCredit("3")
      setFacultyName("")
      setSemester("")
      setCalculationMode("marks")
      setDemoLetterGrade("")
    }
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Course" : "Edit Course"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Course Code *</Label>
              <Input
                id="code"
                placeholder="CSE 501"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit">Credit Hours *</Label>
              <Input
                id="credit"
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                placeholder="3"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              placeholder="Database Systems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty Name</Label>
              <Input
                id="faculty"
                placeholder="Dr. Smith"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                placeholder="Fall 2024"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border p-3">
            <div>
              <Label className="text-sm font-semibold">Grade Calculation Mode</Label>
              <p className="text-xs text-muted-foreground">
                Choose whether this course uses detailed marks or a manual demo grade for CGPA.
              </p>
            </div>
            <RadioGroup
              value={calculationMode}
              onValueChange={(value) => setCalculationMode(value as CourseCalculationMode)}
              className="grid gap-2 sm:grid-cols-2"
            >
              <Label
                htmlFor="mode-marks"
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm",
                  calculationMode === "marks" && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem id="mode-marks" value="marks" className="mt-0.5" />
                <span>
                  <span className="block font-medium text-foreground">Calculate from Marks</span>
                  <span className="block text-xs text-muted-foreground">Use attendance, quizzes, exams, and assignments.</span>
                </span>
              </Label>
              <Label
                htmlFor="mode-demo"
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm",
                  calculationMode === "demoGrade" && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem id="mode-demo" value="demoGrade" className="mt-0.5" />
                <span>
                  <span className="block font-medium text-foreground">Use Demo Grade</span>
                  <span className="block text-xs text-muted-foreground">Pick an expected grade and count it by credit.</span>
                </span>
              </Label>
            </RadioGroup>

            {calculationMode === "demoGrade" && (
              <div className="space-y-3 rounded-md bg-muted/40 p-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="demoGrade">Demo Grade</Label>
                    <Select
                      value={demoLetterGrade || "none"}
                      onValueChange={(value) => setDemoLetterGrade(value === "none" ? "" : value)}
                    >
                      <SelectTrigger id="demoGrade" className="w-full">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select grade</SelectItem>
                        {gradeRules.map((rule) => (
                          <SelectItem key={rule.id} value={rule.letterGrade}>
                            {rule.letterGrade} - Grade Point {rule.gradePoint.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDemoLetterGrade("")}
                    disabled={!demoLetterGrade}
                  >
                    Clear Demo Grade
                  </Button>
                </div>

                <div className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Selected Grade: </span>
                  <span className="font-medium text-foreground">{demoLetterGrade || "Not selected"}</span>
                  <span className="mx-2 text-muted-foreground">|</span>
                  <span className="text-muted-foreground">Grade Point: </span>
                  <span className="font-medium text-foreground">
                    {selectedDemoRule ? selectedDemoRule.gradePoint.toFixed(2) : "Not available"}
                  </span>
                </div>

                {!demoLetterGrade && (
                  <div className="flex items-start gap-2 rounded-md bg-warning/10 p-2 text-xs text-warning-foreground">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Select a demo grade before this course can be included in CGPA.</span>
                  </div>
                )}

                {demoLetterGrade && !selectedDemoRule && (
                  <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>This grade is not in the grading system. Update the grading system or select another grade.</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === "create" ? "Add Course" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
