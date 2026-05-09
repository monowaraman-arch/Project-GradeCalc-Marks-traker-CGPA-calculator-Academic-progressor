"use client"

import { useCallback, useEffect, useState } from "react"
import type { AppData, Course, CGPASettings, GradingSystem, CourseComponent, ComponentItem } from "@/lib/types"
import { loadData, saveData, exportData, importData, resetData, getDefaultAppData } from "@/lib/storage"
import { generateId } from "@/lib/calculations"

function resolveDemoGradePoint(letterGrade: string | null | undefined, gradingSystem: GradingSystem): number | null {
  const normalizedLetter = letterGrade?.trim().toLowerCase()
  if (!normalizedLetter) return null

  return gradingSystem.rules.find(
    rule => rule.letterGrade.trim().toLowerCase() === normalizedLetter
  )?.gradePoint ?? null
}

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load data on mount
  useEffect(() => {
    const loaded = loadData()
    setData(loaded)
    setIsLoading(false)
  }, [])

  // Save data whenever it changes
  useEffect(() => {
    if (data && !isLoading) {
      saveData(data)
    }
  }, [data, isLoading])

  // Default components to add when creating a new course
  const getDefaultComponents = useCallback((): CourseComponent[] => {
    return [
      {
        id: generateId(),
        name: "Attendance",
        weight: 10,
        calculationRule: "direct",
        items: [{ id: generateId(), name: "Attendance", totalMarks: 10, obtainedMarks: null }]
      },
      {
        id: generateId(),
        name: "Quiz",
        weight: 20,
        calculationRule: "best_n_of_m",
        bestN: 2,
        items: [
          { id: generateId(), name: "Quiz 1", totalMarks: 10, obtainedMarks: null },
          { id: generateId(), name: "Quiz 2", totalMarks: 10, obtainedMarks: null },
          { id: generateId(), name: "Quiz 3", totalMarks: 10, obtainedMarks: null }
        ]
      },
      {
        id: generateId(),
        name: "Midterm",
        weight: 30,
        calculationRule: "direct",
        items: [{ id: generateId(), name: "Midterm Exam", totalMarks: 100, obtainedMarks: null }]
      },
      {
        id: generateId(),
        name: "Final",
        weight: 40,
        calculationRule: "direct",
        items: [{ id: generateId(), name: "Final Exam", totalMarks: 100, obtainedMarks: null }]
      }
    ]
  }, [])

  // Course operations
  const addCourse = useCallback((course: Omit<Course, "id" | "createdAt" | "updatedAt">) => {
    const now = Date.now()
    const components = course.components.length > 0 ? course.components : getDefaultComponents()
    const newCourse: Course = {
      ...course,
      calculationMode: course.calculationMode ?? "marks",
      demoLetterGrade: course.demoLetterGrade ?? null,
      demoGradePoint: data ? resolveDemoGradePoint(course.demoLetterGrade, data.gradingSystem) : course.demoGradePoint ?? null,
      components,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    }
    setData(prev => prev ? { ...prev, courses: [...prev.courses, newCourse] } : null)
    return newCourse.id
  }, [data, getDefaultComponents])

  const updateCourse = useCallback((courseId: string, updates: Partial<Course>) => {
    setData(prev => {
      if (!prev) return null
      return {
        ...prev,
        courses: prev.courses.map(course => {
          if (course.id !== courseId) return course

          const mergedCourse = { ...course, ...updates }
          return {
            ...mergedCourse,
            calculationMode: mergedCourse.calculationMode ?? "marks",
            demoLetterGrade: mergedCourse.demoLetterGrade ?? null,
            demoGradePoint: resolveDemoGradePoint(mergedCourse.demoLetterGrade, prev.gradingSystem),
            updatedAt: Date.now()
          }
        })
      }
    })
  }, [])

  const deleteCourse = useCallback((courseId: string) => {
    setData(prev => {
      if (!prev) return null
      return {
        ...prev,
        courses: prev.courses.filter(course => course.id !== courseId)
      }
    })
  }, [])

  const getCourse = useCallback((courseId: string): Course | undefined => {
    return data?.courses.find(course => course.id === courseId)
  }, [data])

  // Component operations
  const addComponent = useCallback((courseId: string, component: Omit<CourseComponent, "id">) => {
    const newComponent: CourseComponent = {
      ...component,
      id: generateId()
    }
    setData(prev => {
      if (!prev) return null
      return {
        ...prev,
        courses: prev.courses.map(course =>
          course.id === courseId
            ? { 
                ...course, 
                components: [...course.components, newComponent],
                updatedAt: Date.now()
              }
            : course
        )
      }
    })
    return newComponent.id
  }, [])

  const updateComponent = useCallback((
    courseId: string, 
    componentId: string, 
    updates: Partial<CourseComponent>
  ) => {
    setData(prev => {
      if (!prev) return null
      return {
        ...prev,
        courses: prev.courses.map(course =>
          course.id === courseId
            ? {
                ...course,
                components: course.components.map(comp =>
                  comp.id === componentId ? { ...comp, ...updates } : comp
                ),
                updatedAt: Date.now()
              }
            : course
        )
      }
    })
  }, [])

  const deleteComponent = useCallback((courseId: string, componentId: string) => {
    setData(prev => {
      if (!prev) return null
      return {
        ...prev,
        courses: prev.courses.map(course =>
          course.id === courseId
            ? {
                ...course,
                components: course.components.filter(comp => comp.id !== componentId),
                updatedAt: Date.now()
              }
            : course
        )
      }
    })
  }, [])

  // Item operations
  const addItem = useCallback((
    courseId: string,
    componentId: string,
    item: Omit<ComponentItem, "id">
  ) => {
    const newItem: ComponentItem = {
      ...item,
      id: generateId()
    }
    setData(prev => {
      if (!prev) return null
      return {
        ...prev,
        courses: prev.courses.map(course =>
          course.id === courseId
            ? {
                ...course,
                components: course.components.map(comp =>
                  comp.id === componentId
                    ? { ...comp, items: [...comp.items, newItem] }
                    : comp
                ),
                updatedAt: Date.now()
              }
            : course
        )
      }
    })
    return newItem.id
  }, [])

  const updateItem = useCallback((
    courseId: string,
    componentId: string,
    itemId: string,
    updates: Partial<ComponentItem>
  ) => {
    setData(prev => {
      if (!prev) return null
      return {
        ...prev,
        courses: prev.courses.map(course =>
          course.id === courseId
            ? {
                ...course,
                components: course.components.map(comp =>
                  comp.id === componentId
                    ? {
                        ...comp,
                        items: comp.items.map(item =>
                          item.id === itemId ? { ...item, ...updates } : item
                        )
                      }
                    : comp
                ),
                updatedAt: Date.now()
              }
            : course
        )
      }
    })
  }, [])

  const deleteItem = useCallback((
    courseId: string,
    componentId: string,
    itemId: string
  ) => {
    setData(prev => {
      if (!prev) return null
      return {
        ...prev,
        courses: prev.courses.map(course =>
          course.id === courseId
            ? {
                ...course,
                components: course.components.map(comp =>
                  comp.id === componentId
                    ? { ...comp, items: comp.items.filter(item => item.id !== itemId) }
                    : comp
                ),
                updatedAt: Date.now()
              }
            : course
        )
      }
    })
  }, [])

  // Grading system operations
  const updateGradingSystem = useCallback((gradingSystem: GradingSystem) => {
    setData(prev => prev ? {
      ...prev,
      gradingSystem,
      courses: prev.courses.map(course => ({
        ...course,
        demoGradePoint: resolveDemoGradePoint(course.demoLetterGrade, gradingSystem)
      }))
    } : null)
  }, [])

  // CGPA settings operations
  const updateCGPASettings = useCallback((settings: CGPASettings) => {
    setData(prev => prev ? { ...prev, cgpaSettings: settings } : null)
  }, [])

  // Data management operations
  const exportAppData = useCallback((): string => {
    return data ? exportData(data) : ""
  }, [data])

  const importAppData = useCallback((jsonString: string): boolean => {
    const imported = importData(jsonString)
    if (imported) {
      setData(imported)
      return true
    }
    return false
  }, [])

  const resetAppData = useCallback(() => {
    const fresh = resetData()
    setData(fresh)
  }, [])

  const clearAllData = useCallback(() => {
    const empty = getDefaultAppData()
    empty.courses = []
    setData(empty)
    saveData(empty)
  }, [])

  return {
    data,
    isLoading,
    // Course operations
    addCourse,
    updateCourse,
    deleteCourse,
    getCourse,
    // Component operations
    addComponent,
    updateComponent,
    deleteComponent,
    // Item operations
    addItem,
    updateItem,
    deleteItem,
    // Grading system
    updateGradingSystem,
    // CGPA settings
    updateCGPASettings,
    // Data management
    exportAppData,
    importAppData,
    resetAppData,
    clearAllData
  }
}
