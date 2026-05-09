"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Pencil, Check, X, AlertCircle, Info } from "lucide-react"
import type { CourseComponent, ComponentItem } from "@/lib/types"
import { calculateComponentScore } from "@/lib/calculations"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MarksEntryProps {
  component: CourseComponent
  onUpdateItem: (itemId: string, updates: Partial<ComponentItem>) => void
  onDeleteItem: (itemId: string) => void
  onAddItem: (item: Omit<ComponentItem, "id">) => void
  onDeleteComponent: () => void
  onEditComponent: () => void
}

const ruleLabels: Record<string, string> = {
  direct: "Direct",
  sum: "Sum",
  average: "Average",
  best_n_of_m: "Best N",
  drop_lowest: "Drop Lowest"
}

const ruleDescriptions: Record<string, string> = {
  direct: "Sum of all marks divided by total possible",
  sum: "Sum of all marks divided by total possible",
  average: "Average of individual item percentages",
  best_n_of_m: "Average of best N item percentages",
  drop_lowest: "Average after dropping lowest percentage"
}

export function MarksEntry({
  component,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onDeleteComponent,
  onEditComponent
}: MarksEntryProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editTotal, setEditTotal] = useState("")
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemTotal, setNewItemTotal] = useState("10")

  const result = calculateComponentScore(component)
  
  const handleStartEdit = (item: ComponentItem) => {
    setEditingItemId(item.id)
    setEditName(item.name)
    setEditTotal(item.totalMarks.toString())
  }

  const handleSaveEdit = (itemId: string) => {
    onUpdateItem(itemId, {
      name: editName,
      totalMarks: parseFloat(editTotal) || 10
    })
    setEditingItemId(null)
  }

  const handleAddItem = () => {
    if (newItemName.trim()) {
      onAddItem({
        name: newItemName.trim(),
        totalMarks: parseFloat(newItemTotal) || 10,
        obtainedMarks: null
      })
      setNewItemName("")
      setNewItemTotal("10")
      setShowAddItem(false)
    }
  }

  const handleMarksChange = (itemId: string, value: string) => {
    const marks = value === "" ? null : parseFloat(value)
    onUpdateItem(itemId, { obtainedMarks: marks })
  }

  // Get item status
  const getItemStatus = (item: ComponentItem) => {
    if (item.obtainedMarks === null) return "missing"
    if (item.obtainedMarks < 0) return "invalid"
    if (item.obtainedMarks > item.totalMarks) return "exceeds"
    return "valid"
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base sm:text-lg">{component.name}</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="shrink-0 cursor-help text-xs">
                      {ruleLabels[component.calculationRule]}
                      {component.calculationRule === "best_n_of_m" && ` ${component.bestN}/${component.items.length}`}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{ruleDescriptions[component.calculationRule]}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
              <span>Weight: {component.weight}%</span>
              <span className="text-foreground font-medium">
                Earned: {result.weightedScore.toFixed(2)}% of {component.weight}%
              </span>
              {result.missingItems > 0 && (
                <span className="text-warning-foreground">
                  ({result.missingItems} missing)
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onEditComponent} className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
              <Pencil className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-2">Edit</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDeleteComponent}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive sm:h-9 sm:w-auto sm:px-3"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Validation warnings */}
        {result.hasInvalidMarks && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-xs sm:text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Some marks exceed total or are invalid</span>
          </div>
        )}
        
        {result.missingItems > 0 && result.missingItems < result.totalItems && (
          <div className="flex items-center gap-2 rounded-md bg-warning/10 p-2 text-xs sm:text-sm text-warning-foreground">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              {result.missingItems} of {result.totalItems} items not entered yet
            </span>
          </div>
        )}
        
        {/* Items list */}
        <div className="space-y-2">
          {component.items.map((item) => {
            const status = getItemStatus(item)
            const percentage = item.totalMarks > 0 && item.obtainedMarks !== null
              ? ((item.obtainedMarks / item.totalMarks) * 100).toFixed(1)
              : null
            
            return (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-2 sm:flex-row sm:items-center sm:gap-3 sm:p-3",
                  status === "exceeds" && "border-destructive bg-destructive/5",
                  status === "invalid" && "border-destructive bg-destructive/5",
                  status === "missing" && "border-dashed"
                )}
              >
                {editingItemId === item.id ? (
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                      placeholder="Item name"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editTotal}
                        onChange={(e) => setEditTotal(e.target.value)}
                        className="w-20"
                        placeholder="Total"
                      />
                      <Button size="sm" variant="ghost" onClick={() => handleSaveEdit(item.id)} className="h-8 w-8 p-0">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingItemId(null)} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-1 items-center justify-between gap-2 sm:justify-start">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          out of {item.totalMarks}
                          {percentage !== null && (
                            <span className={cn(
                              "ml-2",
                              parseFloat(percentage) >= 80 && "text-accent-foreground",
                              parseFloat(percentage) < 50 && "text-destructive"
                            )}>
                              ({percentage}%)
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 sm:hidden">
                        <Button size="sm" variant="ghost" onClick={() => handleStartEdit(item)} className="h-7 w-7 p-0">
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => onDeleteItem(item.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={item.obtainedMarks ?? ""}
                        onChange={(e) => handleMarksChange(item.id, e.target.value)}
                        placeholder="--"
                        className={cn(
                          "h-9 w-full text-center sm:w-20",
                          status === "missing" && "border-dashed",
                          (status === "exceeds" || status === "invalid") && "border-destructive"
                        )}
                      />
                      <div className="hidden items-center gap-1 sm:flex">
                        <Button size="sm" variant="ghost" onClick={() => handleStartEdit(item)} className="h-8 w-8 p-0">
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => onDeleteItem(item.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Add item form */}
        {showAddItem ? (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-2 sm:flex-row sm:items-center sm:p-3">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name"
              className="flex-1"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={newItemTotal}
                onChange={(e) => setNewItemTotal(e.target.value)}
                placeholder="Total"
                className="w-20"
              />
              <Button size="sm" onClick={handleAddItem} className="h-8">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddItem(false)} className="h-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowAddItem(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        )}

        {/* Component score summary */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Component Score</span>
          <span className="font-medium">
            {result.componentPercentage.toFixed(1)}% 
            <span className="text-muted-foreground font-normal ml-1">
              ({result.weightedScore.toFixed(2)}% weighted)
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
