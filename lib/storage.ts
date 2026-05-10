import type { AppData, GradingSystem, Course, CGPASettings } from "./types"
import { generateId } from "./calculations"

const STORAGE_KEY = "grade-calculator-data"
const CURRENT_VERSION = 3

// Default grading system
export const defaultGradingSystem: GradingSystem = {
  id: generateId(),
  name: "Default Grading System",
  rules: [
    { id: generateId(), minPercentage: 93, maxPercentage: 100, letterGrade: "A", description: "Excellent", gradePoint: 4.0 },
    { id: generateId(), minPercentage: 90, maxPercentage: 92, letterGrade: "A-", gradePoint: 3.7 },
    { id: generateId(), minPercentage: 87, maxPercentage: 89, letterGrade: "B+", gradePoint: 3.3 },
    { id: generateId(), minPercentage: 83, maxPercentage: 86, letterGrade: "B", description: "Good", gradePoint: 3.0 },
    { id: generateId(), minPercentage: 80, maxPercentage: 82, letterGrade: "B-", gradePoint: 2.7 },
    { id: generateId(), minPercentage: 77, maxPercentage: 79, letterGrade: "C+", gradePoint: 2.3 },
    { id: generateId(), minPercentage: 73, maxPercentage: 76, letterGrade: "C", description: "Average", gradePoint: 2.0 },
    { id: generateId(), minPercentage: 70, maxPercentage: 72, letterGrade: "C-", gradePoint: 1.7 },
    { id: generateId(), minPercentage: 67, maxPercentage: 69, letterGrade: "D+", gradePoint: 1.3 },
    { id: generateId(), minPercentage: 60, maxPercentage: 66, letterGrade: "D", description: "Poor", gradePoint: 1.0 },
    { id: generateId(), minPercentage: 0, maxPercentage: 59, letterGrade: "F", description: "Failure", gradePoint: 0.0 },
  ]
}

function resolveDemoGradePoint(letterGrade: string | null | undefined, gradingSystem: GradingSystem): number | null {
  const normalizedLetter = letterGrade?.trim().toLowerCase()
  if (!normalizedLetter) return null

  return gradingSystem.rules.find(
    rule => rule.letterGrade.trim().toLowerCase() === normalizedLetter
  )?.gradePoint ?? null
}

export function normalizeCourse(course: Partial<Course>, gradingSystem: GradingSystem): Course {
  const calculationMode = course.calculationMode ?? "marks"
  const demoLetterGrade = course.demoLetterGrade ?? null

  return {
    id: course.id ?? generateId(),
    code: course.code ?? "",
    title: course.title ?? "Untitled Course",
    credit: course.credit ?? 3,
    facultyName: course.facultyName,
    semester: course.semester,
    calculationMode,
    demoLetterGrade,
    demoGradePoint: resolveDemoGradePoint(demoLetterGrade, gradingSystem),
    components: course.components ?? [],
    createdAt: course.createdAt ?? Date.now(),
    updatedAt: course.updatedAt ?? Date.now()
  }
}

export function normalizeAppData(data: Partial<AppData>): AppData {
  const gradingSystem = data.version === CURRENT_VERSION && data.gradingSystem ? data.gradingSystem : defaultGradingSystem
  const cgpaSettings: CGPASettings = {
    previousCGPA: data.cgpaSettings?.previousCGPA ?? null,
    previousCredits: data.cgpaSettings?.previousCredits ?? null
  }

  return {
    courses: (data.courses ?? []).map(course => normalizeCourse(course, gradingSystem)),
    gradingSystem,
    cgpaSettings,
    version: CURRENT_VERSION
  }
}

// Sample course for demonstration
export function createSampleCourse(): Course {
  const now = Date.now()
  return {
    id: generateId(),
    code: "CSE311",
    title: "Database Management System",
    credit: 3,
    facultyName: "TnS1",
    semester: "Spring 2026",
    calculationMode: "marks",
    demoLetterGrade: null,
    demoGradePoint: null,
    components: [
      {
        id: generateId(),
        name: "Attendance",
        weight: 10,
        calculationRule: "direct",
        items: [
          { id: generateId(), name: "Attendance", totalMarks: 10, obtainedMarks: 9 }
        ]
      },
      {
        id: generateId(),
        name: "Quiz",
        weight: 10,
        calculationRule: "best_n_of_m",
        bestN: 2,
        items: [
          { id: generateId(), name: "Quiz 1", totalMarks: 10, obtainedMarks: 8 },
          { id: generateId(), name: "Quiz 2", totalMarks: 10, obtainedMarks: 6 },
          { id: generateId(), name: "Quiz 3", totalMarks: 10, obtainedMarks: 9 }
        ]
      },
      {
        id: generateId(),
        name: "Midterm",
        weight: 20,
        calculationRule: "direct",
        items: [
          { id: generateId(), name: "Midterm Exam", totalMarks: 20, obtainedMarks: 17 }
        ]
      },
      {
        id: generateId(),
        name: "Assignment",
        weight: 10,
        calculationRule: "direct",
        items: [
          { id: generateId(), name: "Assignment", totalMarks: 10, obtainedMarks: 8 }
        ]
      },
      {
        id: generateId(),
        name: "Final",
        weight: 50,
        calculationRule: "direct",
        items: [
          { id: generateId(), name: "Final Exam", totalMarks: 50, obtainedMarks: 42 }
        ]
      }
    ],
    createdAt: now,
    updatedAt: now
  }
}

// Default app data
export function getDefaultAppData(): AppData {
  return {
    courses: [createSampleCourse()],
    gradingSystem: defaultGradingSystem,
    cgpaSettings: {
      previousCGPA: null,
      previousCredits: null
    },
    version: CURRENT_VERSION
  }
}

// Load data from localStorage
export function loadData(): AppData {
  if (typeof window === "undefined") {
    return getDefaultAppData()
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return getDefaultAppData()
    }
    
    const data = JSON.parse(stored) as Partial<AppData>
    return normalizeAppData(data)
  } catch {
    return getDefaultAppData()
  }
}

// Save data to localStorage
export function saveData(data: AppData): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to save data:", error)
  }
}

// Export data as JSON
export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2)
}

// Import data from JSON
export function importData(jsonString: string): AppData | null {
  try {
    const data = JSON.parse(jsonString) as Partial<AppData>
    
    if (!data.courses || !data.gradingSystem || !data.cgpaSettings) {
      return null
    }
    
    return normalizeAppData(data)
  } catch {
    return null
  }
}

// Reset all data
export function resetData(): AppData {
  const defaultData = getDefaultAppData()
  saveData(defaultData)
  return defaultData
}

