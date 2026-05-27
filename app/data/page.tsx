"use client"

import { useState, useRef } from "react"
import { Download, Upload, RefreshCcw, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useApp } from "@/components/app-provider"

export default function DataPage() {
  const { data, isLoading, exportAppData, importAppData, resetAppData, clearAllData } = useApp()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [importText, setImportText] = useState("")
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importError, setImportError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const handleExport = () => {
    const jsonData = exportAppData()
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `grade-calculator-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setImportText(text)
        setImportStatus("idle")
        setImportError("")
      }
      reader.readAsText(file)
    }
  }

  const handleImport = () => {
    if (!importText.trim()) {
      setImportStatus("error")
      setImportError("Please paste or upload JSON data first")
      return
    }

    const success = importAppData(importText)
    if (success) {
      setImportStatus("success")
      setImportText("")
      setImportError("")
    } else {
      setImportStatus("error")
      setImportError("Invalid JSON format. Please check your data and try again.")
    }
  }

  const handleReset = () => {
    resetAppData()
    setShowResetConfirm(false)
  }

  const handleClear = () => {
    clearAllData()
    setShowClearConfirm(false)
  }

  return (
    <div className="app-container space-y-8 py-8">
      <div className="motion-section">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Management</h1>
        <p className="text-muted-foreground">Export, import, or reset your data</p>
      </div>

      {/* Export Section */}
      <Card className="motion-section motion-delay-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download all your courses, marks, and settings as a JSON file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Your export will include:
            </p>
            <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
              <li>{data.courses.length} courses with all components and marks</li>
              <li>{data.gradingSystem.rules.length} grade rules</li>
              <li>CGPA settings</li>
            </ul>
          </div>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Download JSON
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card className="motion-section motion-delay-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Restore your data from a previously exported JSON file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Choose File
            </Button>
            <span className="self-center text-sm text-muted-foreground">
              or paste JSON below
            </span>
          </div>
          
          <Textarea
            placeholder='{"courses": [...], "gradingSystem": {...}, ...}'
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value)
              setImportStatus("idle")
              setImportError("")
            }}
            rows={6}
            className="font-mono text-sm"
          />

          {importStatus === "success" && (
            <div className="flex items-center gap-2 rounded-lg bg-accent/10 p-3 text-sm text-accent">
              <CheckCircle2 className="h-4 w-4" />
              Data imported successfully!
            </div>
          )}

          {importStatus === "error" && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {importError}
            </div>
          )}

          <Button onClick={handleImport} disabled={!importText.trim()}>
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
        </CardContent>
      </Card>

      {/* Reset Section */}
      <Card className="motion-section motion-delay-3 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <RefreshCcw className="h-5 w-5" />
            Reset Data
          </CardTitle>
          <CardDescription>
            Reset to default settings or clear all data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 rounded-lg border border-border p-4">
              <h4 className="font-medium text-foreground">Reset to Defaults</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Restore the sample course and default grading system. Your current data will be replaced.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowResetConfirm(true)}
              >
                Reset to Defaults
              </Button>
            </div>
            
            <div className="flex-1 rounded-lg border border-destructive/20 p-4">
              <h4 className="font-medium text-destructive">Clear All Data</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Remove all courses and start fresh. Grading system will remain.
              </p>
              <Button
                variant="outline"
                className="mt-4 text-destructive border-destructive/50 hover:bg-destructive/10"
                onClick={() => setShowClearConfirm(true)}
              >
                Clear All Courses
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleReset}
        title="Reset to Defaults"
        description="This will replace all your current data with the default sample course and grading system. This action cannot be undone."
        confirmText="Reset"
        variant="destructive"
      />

      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        onConfirm={handleClear}
        title="Clear All Courses"
        description="This will permanently delete all your courses and marks. Your grading system settings will be preserved. This action cannot be undone."
        confirmText="Clear All"
        variant="destructive"
      />
    </div>
  )
}
