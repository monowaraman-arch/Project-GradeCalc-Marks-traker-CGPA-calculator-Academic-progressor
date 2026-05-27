"use client"

import { useApp } from "@/components/app-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  calculateCourseResult, 
  calculateCurrentSemesterCGPA,
  calculateCGPA,
  calculateCurrentSemesterCredits,
} from "@/lib/calculations"
import { Printer, Download, AlertCircle, CheckCircle2 } from "lucide-react"
import { useRef } from "react"

export default function ReportPage() {
  const { data, isLoading } = useApp()
  const printRef = useRef<HTMLDivElement>(null)

  if (isLoading || !data) {
    return (
      <div className="app-container flex min-h-[50vh] items-center justify-center py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const { courses, gradingSystem, cgpaSettings } = data
  const courseResults = courses.map(course => ({
    course,
    result: calculateCourseResult(course, gradingSystem)
  }))

  const currentSemesterCGPA = calculateCurrentSemesterCGPA(courses, gradingSystem)
  const allTimeCGPA = calculateCGPA(courses, gradingSystem, cgpaSettings)
  const totalCredits = courses.reduce((sum, c) => sum + c.credit, 0)
  const countedCredits = calculateCurrentSemesterCredits(courses, gradingSystem)
  const coursesNotIncluded = courseResults.filter(cr => !cr.result.isValidForCGPA)
  const hasIncomplete = coursesNotIncluded.length > 0

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadCSV = () => {
    const headers = [
      "Course Code",
      "Course Title",
      "Credits",
      "Final Marks / Demo Grade",
      "Letter Grade",
      "Grade Point",
      "Included in CGPA"
    ]
    const rows = courseResults.map(cr => [
      cr.course.code,
      cr.course.title,
      cr.course.credit.toString(),
      cr.result.isDemoGrade ? "Manual Demo Grade" : `${cr.result.percentage.toFixed(2)}%`,
      cr.result.letterGrade,
      cr.result.gradePoint.toFixed(2),
      cr.result.isValidForCGPA ? "Yes" : "No"
    ])
    
    const summaryRows = [
      [],
      ["Summary"],
      ["Total Credits", totalCredits.toString()],
      ["Credits Counted in CGPA", countedCredits.toString()],
      ["Current Semester CGPA", currentSemesterCGPA.toFixed(2)],
      ["All-Time CGPA", allTimeCGPA.toFixed(2)]
    ]

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
      ...summaryRows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `semester-report-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  return (
    <div className="app-container py-6 sm:py-8">
      <div className="motion-section mb-6 flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Semester Grade Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and export your semester grade summary
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Download CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Print Report</span>
            <span className="sm:hidden">Print</span>
          </Button>
        </div>
      </div>

      {hasIncomplete && (
        <Card className="motion-section motion-delay-1 mb-6 border-amber-500/50 bg-amber-500/5 print:hidden">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">
                {coursesNotIncluded.length} course{coursesNotIncluded.length > 1 ? "s are" : " is"} not included in CGPA yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete marks-based courses or select valid demo grades so they can count toward CGPA.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div ref={printRef} className="print:p-0">
        <div className="motion-stagger mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 print:grid-cols-4 print:gap-4">
          <Card className="motion-card print:border print:shadow-none">
            <CardContent className="p-3 text-center sm:p-4">
              <p className="text-xs text-muted-foreground sm:text-sm">Total Courses</p>
              <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{courses.length}</p>
            </CardContent>
          </Card>
          <Card className="motion-card print:border print:shadow-none">
            <CardContent className="p-3 text-center sm:p-4">
              <p className="text-xs text-muted-foreground sm:text-sm">Credits Counted</p>
              <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{countedCredits}</p>
            </CardContent>
          </Card>
          <Card className="motion-card print:border print:shadow-none">
            <CardContent className="p-3 text-center sm:p-4">
              <p className="text-xs text-muted-foreground sm:text-sm">Current Semester CGPA</p>
              <p className="mt-1 text-xl font-bold text-primary sm:text-2xl">{currentSemesterCGPA.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="motion-card print:border print:shadow-none">
            <CardContent className="p-3 text-center sm:p-4">
              <p className="text-xs text-muted-foreground sm:text-sm">All-Time CGPA</p>
              <p className="mt-1 text-xl font-bold text-primary sm:text-2xl">{allTimeCGPA.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="motion-section motion-delay-2 print:border print:shadow-none">
          <CardHeader className="print:pb-2">
            <CardTitle className="text-base sm:text-lg">Course Results</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No courses added yet. Add courses to generate your report.
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto sm:block print:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 font-medium text-muted-foreground">Course Code</th>
                        <th className="pb-3 font-medium text-muted-foreground">Course Title</th>
                        <th className="pb-3 text-center font-medium text-muted-foreground">Credits</th>
                        <th className="pb-3 text-center font-medium text-muted-foreground">Final Marks / Demo Grade</th>
                        <th className="pb-3 text-center font-medium text-muted-foreground">Letter Grade</th>
                        <th className="pb-3 text-center font-medium text-muted-foreground">Grade Point</th>
                        <th className="pb-3 text-center font-medium text-muted-foreground print:hidden">Status</th>
                      </tr>
                    </thead>
                    <tbody className="motion-stagger-left">
                      {courseResults.map(({ course, result }) => (
                        <tr key={course.id} className="border-b border-border/50 last:border-0">
                          <td className="py-3 font-medium">{course.code}</td>
                          <td className="py-3 text-foreground">{course.title}</td>
                          <td className="py-3 text-center">{course.credit}</td>
                          <td className="py-3 text-center">{result.isDemoGrade ? "Manual Demo Grade" : `${result.percentage.toFixed(1)}%`}</td>
                          <td className="py-3 text-center">
                            <Badge 
                              variant={result.gradePoint >= 3.5 ? "default" : result.gradePoint >= 2.0 ? "secondary" : "outline"}
                              className="font-mono"
                            >
                              {result.letterGrade}
                            </Badge>
                          </td>
                          <td className="py-3 text-center font-mono">{result.gradePoint.toFixed(2)}</td>
                          <td className="py-3 text-center print:hidden">
                            {result.isValidForCGPA ? (
                              <CheckCircle2 className="mx-auto h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="mx-auto h-4 w-4 text-amber-500" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="motion-stagger-left space-y-3 sm:hidden print:hidden">
                  {courseResults.map(({ course, result }) => (
                    <div key={course.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{course.code}</p>
                          <p className="truncate text-sm text-muted-foreground">{course.title}</p>
                        </div>
                        <Badge 
                          variant={result.gradePoint >= 3.5 ? "default" : result.gradePoint >= 2.0 ? "secondary" : "outline"}
                          className="font-mono"
                        >
                          {result.letterGrade}
                        </Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div>
                          <p className="text-muted-foreground">Final</p>
                          <p className="font-medium">{result.isDemoGrade ? "Manual Demo Grade" : `${result.percentage.toFixed(1)}%`}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Grade Point</p>
                          <p className="font-mono font-medium">{result.gradePoint.toFixed(2)}</p>
                        </div>
                      </div>
                      {result.isDemoGrade && <Badge variant="outline" className="mt-2">Demo Grade Used</Badge>}
                      {!result.isValidForCGPA && result.statusMessage && (
                        <div className="mt-2 flex items-start gap-1 text-xs text-amber-600">
                          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>{result.statusMessage}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
                    <p className="mb-2 text-center text-sm font-medium text-foreground">Summary</p>
                    <div className="text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Credits Counted</p>
                        <p className="font-bold">{countedCredits}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {cgpaSettings.previousCGPA !== null && cgpaSettings.previousCredits !== null && (
          <Card className="motion-section motion-delay-3 mt-6 print:border print:shadow-none">
            <CardHeader className="print:pb-2">
              <CardTitle className="text-base sm:text-lg">All-Time CGPA Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground sm:text-sm">Previous Record</p>
                  <p className="mt-1 text-lg font-bold">
                    {cgpaSettings.previousCGPA.toFixed(2)} CGPA
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cgpaSettings.previousCredits} completed credits
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground sm:text-sm">Current Semester</p>
                  <p className="mt-1 text-lg font-bold">
                    {currentSemesterCGPA.toFixed(2)} CGPA
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {countedCredits} credits counted
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-center">
                  <p className="text-xs text-muted-foreground sm:text-sm">All-Time</p>
                  <p className="mt-1 text-lg font-bold text-primary">
                    {allTimeCGPA.toFixed(2)} CGPA
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cgpaSettings.previousCredits + countedCredits} total counted credits
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center text-xs text-muted-foreground print:mt-8">
          <p>This report was generated by GradeCalc on {currentDate}</p>
          <p className="mt-1">Results are calculated based on the configured grading system.</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
