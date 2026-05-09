"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Info } from "lucide-react"
import type { CourseComponent, CalculationRule } from "@/lib/types"
import { generateId } from "@/lib/calculations"
import { cn } from "@/lib/utils"

interface ComponentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (component: Omit<CourseComponent, "id">) => void
  initialData?: Partial<CourseComponent>
  mode?: "create" | "edit"
  currentTotalWeight?: number // Total weight of other components (excluding this one if editing)
}

const calculationRules: { value: CalculationRule; label: string; description: string }[] = [
  { value: "direct", label: "Direct Entry", description: "Sum all marks divided by total possible" },
  { value: "sum", label: "Sum", description: "Sum of all items divided by total possible" },
  { value: "average", label: "Average", description: "Average of individual item percentages" },
  { value: "best_n_of_m", label: "Best N of M", description: "Average of best N item percentages" },
  { value: "drop_lowest", label: "Drop Lowest", description: "Average after dropping lowest score" },
]

export function ComponentForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData,
  mode = "create",
  currentTotalWeight = 0
}: ComponentFormProps) {
  const [name, setName] = useState(initialData?.name ?? "")
  const [weight, setWeight] = useState(initialData?.weight?.toString() ?? "10")
  const [rule, setRule] = useState<CalculationRule>(initialData?.calculationRule ?? "direct")
  const [bestN, setBestN] = useState(initialData?.bestN?.toString() ?? "2")
  const [itemCount, setItemCount] = useState("1")
  const [itemTotalMarks, setItemTotalMarks] = useState("10")

  // Reset form when initialData changes
  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "")
      setWeight(initialData?.weight?.toString() ?? "10")
      setRule(initialData?.calculationRule ?? "direct")
      setBestN(initialData?.bestN?.toString() ?? "2")
      setItemCount("1")
      setItemTotalMarks("10")
    }
  }, [open, initialData])

  const parsedWeight = parseFloat(weight) || 0
  const newTotalWeight = currentTotalWeight + parsedWeight
  const remainingWeight = 100 - currentTotalWeight
  const isWeightValid = newTotalWeight <= 100
  const suggestedWeight = Math.max(0, remainingWeight)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const count = parseInt(itemCount) || 1
    const totalMarks = parseFloat(itemTotalMarks) || 10
    
    // Generate items based on count
    const items = mode === "create" 
      ? Array.from({ length: count }, (_, i) => ({
          id: generateId(),
          name: count === 1 ? name : `${name} ${i + 1}`,
          totalMarks,
          obtainedMarks: null
        }))
      : initialData?.items ?? []
    
    onSubmit({
      name: name.trim(),
      weight: parsedWeight,
      calculationRule: rule,
      bestN: rule === "best_n_of_m" ? parseInt(bestN) || 2 : undefined,
      items
    })
    
    onOpenChange(false)
  }

  const parsedItemCount = parseInt(itemCount) || 1
  const parsedBestN = parseInt(bestN) || 2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Component" : "Edit Component"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Add a new grading component like Quiz, Midterm, or Assignment"
              : "Update the component settings"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Component Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Quiz, Midterm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (%) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.5"
                min="0"
                max="100"
                placeholder="10"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={cn(!isWeightValid && "border-destructive")}
                required
              />
              {currentTotalWeight > 0 && (
                <p className={cn(
                  "text-xs",
                  isWeightValid ? "text-muted-foreground" : "text-destructive"
                )}>
                  {isWeightValid 
                    ? `${remainingWeight.toFixed(1)}% remaining`
                    : `Exceeds 100% by ${(newTotalWeight - 100).toFixed(1)}%`}
                </p>
              )}
            </div>
          </div>

          {!isWeightValid && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Total weight would be {newTotalWeight.toFixed(1)}%. Max is 100%.</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="rule">Calculation Rule</Label>
            <Select value={rule} onValueChange={(v) => setRule(v as CalculationRule)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {calculationRules.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex flex-col py-0.5">
                      <span className="font-medium">{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {rule === "best_n_of_m" && (
            <div className="space-y-2">
              <Label htmlFor="bestN">Best N scores to count</Label>
              <Input
                id="bestN"
                type="number"
                min="1"
                placeholder="2"
                value={bestN}
                onChange={(e) => setBestN(e.target.value)}
              />
              {mode === "create" && parsedItemCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Best {parsedBestN} out of {parsedItemCount} items will be counted
                </p>
              )}
            </div>
          )}
          
          {mode === "create" && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="itemCount">Number of Items</Label>
                  <Input
                    id="itemCount"
                    type="number"
                    min="1"
                    max="20"
                    placeholder="1"
                    value={itemCount}
                    onChange={(e) => setItemCount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    e.g., 3 for Quiz 1, Quiz 2, Quiz 3
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemTotalMarks">Total Marks per Item</Label>
                  <Input
                    id="itemTotalMarks"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={itemTotalMarks}
                    onChange={(e) => setItemTotalMarks(e.target.value)}
                  />
                </div>
              </div>

              {rule === "best_n_of_m" && parsedBestN >= parsedItemCount && parsedItemCount > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-warning/10 p-2 text-sm text-warning-foreground">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>
                    Best {parsedBestN} of {parsedItemCount} will count all items. 
                    Consider adding more items or reducing N.
                  </span>
                </div>
              )}
            </>
          )}

          {/* Rule explanation */}
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <p className="font-medium text-foreground mb-1">
              {calculationRules.find(r => r.value === rule)?.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {rule === "direct" || rule === "sum" 
                ? "Adds all obtained marks and divides by total possible marks to get percentage."
                : rule === "average"
                ? "Calculates each item's percentage individually, then averages them."
                : rule === "best_n_of_m"
                ? `Takes the best ${parsedBestN} item percentages and averages them, ignoring lower scores.`
                : "Drops the lowest percentage score and averages the remaining items."}
            </p>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {mode === "create" ? "Add Component" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
