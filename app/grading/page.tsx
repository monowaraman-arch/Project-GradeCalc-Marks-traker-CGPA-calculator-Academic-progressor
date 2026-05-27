"use client"

import { useState } from "react"
import { Plus, Trash2, Pencil, Check, X, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useApp } from "@/components/app-provider"
import { validateGradeRanges, generateId } from "@/lib/calculations"
import type { GradeRule } from "@/lib/types"

export default function GradingPage() {
  const { data, isLoading, updateGradingSystem } = useApp()
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<GradeRule>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRule, setNewRule] = useState<Partial<GradeRule>>({
    minPercentage: 0,
    maxPercentage: 100,
    letterGrade: "",
    description: "",
    gradePoint: 0
  })
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const validation = validateGradeRanges(data.gradingSystem)
  const sortedRules = [...data.gradingSystem.rules].sort(
    (a, b) => b.minPercentage - a.minPercentage
  )

  const handleStartEdit = (rule: GradeRule) => {
    setEditingRule(rule.id)
    setEditValues({
      minPercentage: rule.minPercentage,
      maxPercentage: rule.maxPercentage,
      letterGrade: rule.letterGrade,
      description: rule.description ?? "",
      gradePoint: rule.gradePoint
    })
  }

  const handleSaveEdit = () => {
    if (editingRule && editValues.letterGrade) {
      const updatedRules = data.gradingSystem.rules.map(rule =>
        rule.id === editingRule
          ? {
              ...rule,
              minPercentage: editValues.minPercentage ?? rule.minPercentage,
              maxPercentage: editValues.maxPercentage ?? rule.maxPercentage,
              letterGrade: editValues.letterGrade ?? rule.letterGrade,
              description: editValues.description?.trim() || undefined,
              gradePoint: editValues.gradePoint ?? rule.gradePoint
            }
          : rule
      )
      updateGradingSystem({
        ...data.gradingSystem,
        rules: updatedRules
      })
      setEditingRule(null)
      setEditValues({})
    }
  }

  const handleAddRule = () => {
    if (newRule.letterGrade) {
      const rule: GradeRule = {
        id: generateId(),
        minPercentage: newRule.minPercentage ?? 0,
        maxPercentage: newRule.maxPercentage ?? 100,
        letterGrade: newRule.letterGrade,
        description: newRule.description?.trim() || undefined,
        gradePoint: newRule.gradePoint ?? 0
      }
      updateGradingSystem({
        ...data.gradingSystem,
        rules: [...data.gradingSystem.rules, rule]
      })
      setShowAddForm(false)
      setNewRule({ minPercentage: 0, maxPercentage: 100, letterGrade: "", description: "", gradePoint: 0 })
    }
  }

  const handleDeleteRule = () => {
    if (deleteTarget) {
      updateGradingSystem({
        ...data.gradingSystem,
        rules: data.gradingSystem.rules.filter(rule => rule.id !== deleteTarget)
      })
      setDeleteTarget(null)
    }
  }

  return (
    <div className="app-container space-y-6 py-6 sm:space-y-8 sm:py-8">
      <div className="motion-section flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Grading System</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Customize your university grading scale</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Grade
        </Button>
      </div>

      {validation.errors.length > 0 && (
        <div className="motion-section motion-delay-1 flex items-start gap-3 rounded-lg border border-destructive bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Grade range errors</p>
            <ul className="mt-1 text-sm text-destructive/90 list-disc list-inside space-y-0.5">
              {validation.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="motion-section motion-delay-1 flex items-start gap-3 rounded-lg border border-warning bg-warning/10 p-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-warning-foreground" />
          <div>
            <p className="font-medium text-warning-foreground">Grade range warnings</p>
            <ul className="mt-1 text-sm text-warning-foreground/90 list-disc list-inside space-y-0.5">
              {validation.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Card className="motion-section motion-delay-2">
        <CardHeader>
          <CardTitle>Grade Rules</CardTitle>
          <CardDescription>
            Define percentage cutoffs, letter grades, descriptions, and grade points. Decimal scores are compared directly without rounding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hidden rounded-lg border border-border overflow-hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Min %</TableHead>
                  <TableHead>Max %</TableHead>
                  <TableHead>Letter Grade</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Grade Point</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="motion-stagger-left">
                {sortedRules.map((rule) => (
                  <TableRow key={rule.id}>
                    {editingRule === rule.id ? (
                      <>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={editValues.minPercentage ?? ""}
                            onChange={(e) => setEditValues({
                              ...editValues,
                              minPercentage: parseFloat(e.target.value) || 0
                            })}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={editValues.maxPercentage ?? ""}
                            onChange={(e) => setEditValues({
                              ...editValues,
                              maxPercentage: parseFloat(e.target.value) || 0
                            })}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editValues.letterGrade ?? ""}
                            onChange={(e) => setEditValues({
                              ...editValues,
                              letterGrade: e.target.value
                            })}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editValues.description ?? ""}
                            onChange={(e) => setEditValues({
                              ...editValues,
                              description: e.target.value
                            })}
                            className="w-28"
                            placeholder="Optional"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="4.5"
                            value={editValues.gradePoint ?? ""}
                            onChange={(e) => setEditValues({
                              ...editValues,
                              gradePoint: parseFloat(e.target.value) || 0
                            })}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingRule(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{rule.minPercentage}%</TableCell>
                        <TableCell>{rule.maxPercentage}%</TableCell>
                        <TableCell className="font-medium">{rule.letterGrade}</TableCell>
                        <TableCell>{rule.description ?? "-"}</TableCell>
                        <TableCell>{rule.gradePoint.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleStartEdit(rule)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="motion-stagger-left space-y-3 sm:hidden">
            {sortedRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 p-3"
              >
                {editingRule === rule.id ? (
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Min %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={editValues.minPercentage ?? ""}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            minPercentage: parseFloat(e.target.value) || 0
                          })}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Max %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={editValues.maxPercentage ?? ""}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            maxPercentage: parseFloat(e.target.value) || 0
                          })}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Letter</Label>
                        <Input
                          value={editValues.letterGrade ?? ""}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            letterGrade: e.target.value
                          })}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Grade Point</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="4.5"
                          value={editValues.gradePoint ?? ""}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            gradePoint: parseFloat(e.target.value) || 0
                          })}
                          className="h-8"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={editValues.description ?? ""}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            description: e.target.value
                          })}
                          className="h-8"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={handleSaveEdit} className="h-7 px-3">
                        <Check className="mr-1 h-3 w-3" />
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingRule(null)} className="h-7 px-3">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">{rule.letterGrade}</span>
                        <span className="text-sm text-muted-foreground">(Grade Point {rule.gradePoint.toFixed(2)})</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.minPercentage}% - {rule.maxPercentage}%{rule.description ? ` | ${rule.description}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleStartEdit(rule)} className="h-8 w-8 p-0">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="motion-section motion-delay-3 border-muted">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Tips for Grade Ranges</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Scores must be numbers between 0 and 100</li>
                <li>Decimal scores are compared directly without rounding</li>
                <li>For example, 92.5 uses the first rule whose minimum cutoff is less than or equal to 92.5</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card className="motion-section motion-delay-3">
          <CardHeader>
            <CardTitle>Add New Grade Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-6 sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="minPct">Min Percentage</Label>
                <Input
                  id="minPct"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newRule.minPercentage ?? ""}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    minPercentage: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPct">Max Percentage</Label>
                <Input
                  id="maxPct"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newRule.maxPercentage ?? ""}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    maxPercentage: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="letterGrade">Letter Grade</Label>
                <Input
                  id="letterGrade"
                  value={newRule.letterGrade ?? ""}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    letterGrade: e.target.value
                  })}
                  placeholder="A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newRule.description ?? ""}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    description: e.target.value
                  })}
                  placeholder="Excellent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradePoint">Grade Point</Label>
                <Input
                  id="gradePoint"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.5"
                  value={newRule.gradePoint ?? ""}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    gradePoint: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddRule} className="flex-1 sm:flex-none">Add</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 sm:flex-none">Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteRule}
        title="Delete Grade Rule"
        description="Are you sure you want to delete this grade rule? This may affect how grades are calculated."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
