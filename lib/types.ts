// Calculation rule types
export type CalculationRule = 
  | "direct" 
  | "best_n_of_m" 
  | "average" 
  | "sum" 
  | "drop_lowest"

export type CourseCalculationMode = "marks" | "demoGrade"

// Individual item in a component group (e.g., Quiz 1, Quiz 2)
export interface ComponentItem {
  id: string
  name: string
  totalMarks: number
  obtainedMarks: number | null
}

// A component in a course (e.g., Quiz, Midterm, Assignment)
export interface CourseComponent {
  id: string
  name: string
  weight: number // Percentage contribution (e.g., 10 for 10%)
  calculationRule: CalculationRule
  bestN?: number // For best_n_of_m rule
  items: ComponentItem[]
}

// Course data structure
export interface Course {
  id: string
  code: string
  title: string
  credit: number
  facultyName?: string
  semester?: string
  calculationMode: CourseCalculationMode
  demoLetterGrade: string | null
  demoGradePoint: number | null
  components: CourseComponent[]
  createdAt: number
  updatedAt: number
}

// Grade rule
export interface GradeRule {
  id: string
  minPercentage: number
  maxPercentage: number
  letterGrade: string
  description?: string
  gradePoint: number
}

// Grading system
export interface GradingSystem {
  id: string
  name: string
  rules: GradeRule[]
}

// CGPA Settings
export interface CGPASettings {
  previousCGPA: number | null
  previousCredits: number | null
}

// App data structure for localStorage
export interface AppData {
  courses: Course[]
  gradingSystem: GradingSystem
  cgpaSettings: CGPASettings
  version: number
}

// Calculated course result
export interface CourseResult {
  courseId: string
  totalObtained: number
  totalPossible: number
  percentage: number
  letterGrade: string
  description?: string
  gradePoint: number
  weightedGradePoint: number
  calculationMode: CourseCalculationMode
  isDemoGrade: boolean
  isValidForCGPA: boolean
  gradeRuleFound: boolean
  statusMessage: string | null
}

// Component calculation result
export interface ComponentResult {
  componentId: string
  calculatedScore: number
  maxScore: number
  weightedScore: number
}

