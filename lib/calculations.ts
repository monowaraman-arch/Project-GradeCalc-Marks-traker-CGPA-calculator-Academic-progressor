import type { 
  CourseComponent, 
  Course, 
  GradingSystem, 
  CourseResult, 
  ComponentResult,
  CGPASettings,
  CourseCalculationMode,
  GradeRule
} from "./types"

export function getCourseCalculationMode(course: Course): CourseCalculationMode {
  return course.calculationMode ?? "marks"
}

export function findGradeRuleByLetter(
  letterGrade: string | null | undefined,
  gradingSystem: GradingSystem
): GradeRule | undefined {
  const normalizedLetter = letterGrade?.trim().toLowerCase()
  if (!normalizedLetter) return undefined

  return gradingSystem.rules.find(
    rule => rule.letterGrade.trim().toLowerCase() === normalizedLetter
  )
}

// Calculate component score based on rule
// Returns: componentPercentage (0-100), weightedScore (contribution to final grade)
export function calculateComponentScore(component: CourseComponent): ComponentResult & {
  componentPercentage: number
  missingItems: number
  totalItems: number
  hasInvalidMarks: boolean
} {
  const validItems = component.items.filter(item => item.obtainedMarks !== null)
  const missingItems = component.items.length - validItems.length
  const totalItems = component.items.length
  const hasInvalidMarks = component.items.some(
    item => item.obtainedMarks !== null && (item.obtainedMarks > item.totalMarks || item.obtainedMarks < 0)
  )
  
  if (validItems.length === 0) {
    return {
      componentId: component.id,
      calculatedScore: 0,
      maxScore: 0,
      weightedScore: 0,
      componentPercentage: 0,
      missingItems,
      totalItems,
      hasInvalidMarks
    }
  }

  let componentPercentage = 0

  switch (component.calculationRule) {
    case "direct":
    case "sum": {
      // Direct/Sum: Total obtained / Total possible * 100
      const totalObtained = validItems.reduce((sum, item) => sum + (item.obtainedMarks ?? 0), 0)
      const totalPossible = validItems.reduce((sum, item) => sum + item.totalMarks, 0)
      componentPercentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0
      break
    }
    
    case "average": {
      // Average: Mean of individual item percentages
      const percentages = validItems.map(item => {
        const itemPercentage = item.totalMarks > 0 
          ? ((item.obtainedMarks ?? 0) / item.totalMarks) * 100 
          : 0
        return Math.min(itemPercentage, 100)
      })
      componentPercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length
      break
    }
    
    case "best_n_of_m": {
      // Best N: Take best N percentages, average them
      const n = Math.min(component.bestN ?? validItems.length, validItems.length)
      if (n <= 0) {
        componentPercentage = 0
        break
      }
      
      const sortedByPercentage = [...validItems].sort((a, b) => {
        const percA = a.totalMarks > 0 ? ((a.obtainedMarks ?? 0) / a.totalMarks) : 0
        const percB = b.totalMarks > 0 ? ((b.obtainedMarks ?? 0) / b.totalMarks) : 0
        return percB - percA
      })
      
      const bestItems = sortedByPercentage.slice(0, n)
      const percentages = bestItems.map(item => {
        const itemPercentage = item.totalMarks > 0 
          ? ((item.obtainedMarks ?? 0) / item.totalMarks) * 100 
          : 0
        return Math.min(itemPercentage, 100)
      })
      componentPercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length
      break
    }
    
    case "drop_lowest": {
      // Drop lowest: Remove lowest percentage, average the rest
      if (validItems.length <= 1) {
        componentPercentage = validItems.length === 1 && validItems[0].totalMarks > 0
          ? Math.min(((validItems[0].obtainedMarks ?? 0) / validItems[0].totalMarks) * 100, 100)
          : 0
      } else {
        const sortedByPercentage = [...validItems].sort((a, b) => {
          const percA = a.totalMarks > 0 ? ((a.obtainedMarks ?? 0) / a.totalMarks) : 0
          const percB = b.totalMarks > 0 ? ((b.obtainedMarks ?? 0) / b.totalMarks) : 0
          return percA - percB
        })
        const withoutLowest = sortedByPercentage.slice(1)
        const percentages = withoutLowest.map(item => {
          const itemPercentage = item.totalMarks > 0 
            ? ((item.obtainedMarks ?? 0) / item.totalMarks) * 100 
            : 0
          return Math.min(itemPercentage, 100)
        })
        componentPercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length
      }
      break
    }
  }

  componentPercentage = Math.max(0, Math.min(100, componentPercentage))
  const weightedScore = (componentPercentage / 100) * component.weight

  return {
    componentId: component.id,
    calculatedScore: componentPercentage,
    maxScore: 100,
    weightedScore,
    componentPercentage,
    missingItems,
    totalItems,
    hasInvalidMarks
  }
}

// Calculate total course result
export function calculateCourseResult(
  course: Course, 
  gradingSystem: GradingSystem
): CourseResult {
  const calculationMode = getCourseCalculationMode(course)

  if (calculationMode === "demoGrade") {
    const selectedGrade = course.demoLetterGrade?.trim() ?? ""
    const gradeRule = findGradeRuleByLetter(selectedGrade, gradingSystem)
    const gradePoint = gradeRule?.gradePoint ?? 0
    const letterGrade = selectedGrade || "Not Set"
    const statusMessage = !selectedGrade
      ? "Select a demo grade before this course counts in CGPA."
      : !gradeRule
        ? "This demo grade is not in the grading system. Update the grading system or select another grade."
        : null

    return {
      courseId: course.id,
      totalObtained: 0,
      totalPossible: 0,
      percentage: 0,
      letterGrade: gradeRule?.letterGrade ?? letterGrade,
      gradePoint,
      weightedGradePoint: gradePoint * course.credit,
      calculationMode,
      isDemoGrade: true,
      isValidForCGPA: statusMessage === null && course.credit > 0,
      gradeRuleFound: !!gradeRule,
      statusMessage
    }
  }

  const componentResults = course.components.map(calculateComponentScore)
  const totalPercentage = componentResults.reduce(
    (sum, result) => sum + result.weightedScore, 
    0
  )

  const { letterGrade, gradePoint, isMatched, errorMessage } = matchGrade(totalPercentage, gradingSystem)
  const weightValidation = validateComponentWeights(course.components)
  const completeness = validateCourseCompleteness(course)
  const statusMessage = !weightValidation.isValid
    ? "Component weights must add up to 100% before this course counts in CGPA."
    : completeness.invalidMarksCount > 0
      ? "Fix invalid marks before this course counts in CGPA."
      : completeness.missingMarksCount > 0
        ? "Enter all marks or use Demo Grade before this course counts in CGPA."
        : !isMatched
          ? errorMessage ?? "No grade rule matches this score. Update the grading system."
          : null

  const weightedGradePoint = gradePoint * course.credit

  return {
    courseId: course.id,
    totalObtained: totalPercentage,
    totalPossible: 100,
    percentage: totalPercentage,
    letterGrade,
    gradePoint,
    weightedGradePoint,
    calculationMode,
    isDemoGrade: false,
    isValidForCGPA: statusMessage === null && course.credit > 0,
    gradeRuleFound: isMatched,
    statusMessage
  }
}

// Match percentage to grade
export function matchGrade(
  percentage: number, 
  gradingSystem: GradingSystem
): { letterGrade: string; gradePoint: number; isMatched: boolean; errorMessage?: string } {
  if (!Number.isFinite(percentage)) {
    return {
      letterGrade: "Invalid",
      gradePoint: 0,
      isMatched: false,
      errorMessage: "Score must be a number."
    }
  }

  if (percentage < 0 || percentage > 100) {
    return {
      letterGrade: "Invalid",
      gradePoint: 0,
      isMatched: false,
      errorMessage: "Score must be between 0 and 100."
    }
  }

  const sortedRules = [...gradingSystem.rules].sort(
    (a, b) => b.minPercentage - a.minPercentage
  )

  // Decimal scores are compared directly against cutoff thresholds without rounding.
  for (const rule of sortedRules) {
    if (percentage >= rule.minPercentage) {
      return {
        letterGrade: rule.letterGrade,
        gradePoint: rule.gradePoint,
        isMatched: true
      }
    }
  }
  
  return {
    letterGrade: "Invalid",
    gradePoint: 0,
    isMatched: false,
    errorMessage: "No grade rule matches this score. Update the grading system."
  }
}

export function calculateCurrentSemesterWeightedPoints(
  courses: Course[],
  gradingSystem: GradingSystem
): number {
  return courses.reduce((sum, course) => {
    const result = calculateCourseResult(course, gradingSystem)
    return result.isValidForCGPA ? sum + result.weightedGradePoint : sum
  }, 0)
}

export function calculateCurrentSemesterCredits(
  courses: Course[],
  gradingSystem: GradingSystem
): number {
  return courses.reduce((sum, course) => {
    const result = calculateCourseResult(course, gradingSystem)
    return result.isValidForCGPA ? sum + course.credit : sum
  }, 0)
}

export function calculateCurrentSemesterCGPA(courses: Course[], gradingSystem: GradingSystem): number {
  const totalCredits = calculateCurrentSemesterCredits(courses, gradingSystem)
  if (totalCredits === 0) return 0

  return calculateCurrentSemesterWeightedPoints(courses, gradingSystem) / totalCredits
}

// Backward-compatible name used by older screens.
export function calculateSGPA(courses: Course[], gradingSystem: GradingSystem): number {
  return calculateCurrentSemesterCGPA(courses, gradingSystem)
}

// Calculate all-time CGPA
export function calculateCGPA(
  courses: Course[], 
  gradingSystem: GradingSystem,
  cgpaSettings: CGPASettings
): number {
  const currentWeightedPoints = calculateCurrentSemesterWeightedPoints(courses, gradingSystem)
  const currentCredits = calculateCurrentSemesterCredits(courses, gradingSystem)
  
  if (cgpaSettings.previousCGPA === null || cgpaSettings.previousCredits === null) {
    return currentCredits > 0 ? currentWeightedPoints / currentCredits : 0
  }
  
  const previousWeightedPoints = cgpaSettings.previousCGPA * cgpaSettings.previousCredits
  const totalCredits = cgpaSettings.previousCredits + currentCredits
  
  return totalCredits > 0 
    ? (previousWeightedPoints + currentWeightedPoints) / totalCredits 
    : 0
}

// Validate component weights sum to 100
export function validateComponentWeights(components: CourseComponent[]): {
  isValid: boolean
  total: number
  difference: number
} {
  const total = components.reduce((sum, comp) => sum + comp.weight, 0)
  const difference = 100 - total
  return {
    isValid: Math.abs(difference) < 0.01,
    total,
    difference
  }
}

// Validate course data completeness
export function validateCourseCompleteness(course: Course): {
  isComplete: boolean
  missingMarksCount: number
  invalidMarksCount: number
  componentIssues: Array<{
    componentId: string
    componentName: string
    missingItems: number
    invalidItems: number
  }>
} {
  let missingMarksCount = 0
  let invalidMarksCount = 0
  const componentIssues: Array<{
    componentId: string
    componentName: string
    missingItems: number
    invalidItems: number
  }> = []

  for (const component of course.components) {
    let missingItems = 0
    let invalidItems = 0

    for (const item of component.items) {
      if (item.obtainedMarks === null) {
        missingItems++
        missingMarksCount++
      } else if (item.obtainedMarks > item.totalMarks || item.obtainedMarks < 0) {
        invalidItems++
        invalidMarksCount++
      }
    }

    if (missingItems > 0 || invalidItems > 0) {
      componentIssues.push({
        componentId: component.id,
        componentName: component.name,
        missingItems,
        invalidItems
      })
    }
  }

  return {
    isComplete: missingMarksCount === 0 && invalidMarksCount === 0,
    missingMarksCount,
    invalidMarksCount,
    componentIssues
  }
}

// Validate grade ranges don't overlap and cover 0-100
export function validateGradeRanges(gradingSystem: GradingSystem): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (gradingSystem.rules.length === 0) {
    errors.push("No grade rules defined")
    return { isValid: false, errors, warnings }
  }

  const sortedRules = [...gradingSystem.rules].sort(
    (a, b) => b.minPercentage - a.minPercentage
  )
  
  for (const rule of sortedRules) {
    if (rule.minPercentage > rule.maxPercentage) {
      errors.push(`Invalid range for ${rule.letterGrade}: min (${rule.minPercentage}%) > max (${rule.maxPercentage}%)`)
    }
    if (rule.minPercentage < 0 || rule.maxPercentage > 100) {
      errors.push(`${rule.letterGrade} has range outside 0-100%`)
    }
    if (rule.gradePoint < 0 || rule.gradePoint > 4.5) {
      warnings.push(`${rule.letterGrade} has unusual grade point: ${rule.gradePoint}`)
    }
  }
  
  for (let i = 0; i < sortedRules.length - 1; i++) {
    const current = sortedRules[i]
    const next = sortedRules[i + 1]
    
    if (current.minPercentage < next.maxPercentage) {
      errors.push(`Overlapping ranges: ${current.letterGrade} (${current.minPercentage}-${current.maxPercentage}%) and ${next.letterGrade} (${next.minPercentage}-${next.maxPercentage}%)`)
    }
    
    const gap = current.minPercentage - next.maxPercentage
    if (gap > 1) {
      warnings.push(`Gap of ${gap.toFixed(1)}% between ${current.letterGrade} and ${next.letterGrade}`)
    }
  }
  
  const highestMax = Math.max(...sortedRules.map(r => r.maxPercentage))
  const lowestMin = Math.min(...sortedRules.map(r => r.minPercentage))
  
  if (highestMax < 100) {
    warnings.push(`No grade covers scores above ${highestMax}%`)
  }
  if (lowestMin > 0) {
    warnings.push(`No grade covers scores below ${lowestMin}%`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}


