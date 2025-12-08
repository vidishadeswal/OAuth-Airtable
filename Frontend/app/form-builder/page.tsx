"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { useAppState } from "@/lib/store"
import { createForm, getAuthToken } from "@/lib/api"
import { FieldSelector } from "@/components/field-selector"
import { FieldConfigCard } from "@/components/field-config-card"
import { ConditionsEditor } from "@/components/conditions-editor"
import { useEffect } from "react"

export default function FormBuilderPage() {
  const router = useRouter()
  const {
    selectedBase,
    selectedTable,
    availableFields,
    selectedFields,
    addField,
    removeField,
    updateField,
    rules,
    addRule,
    updateRule,
    removeRule,
  } = useAppState()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.push("/")
      return
    }

    if (!selectedBase || !selectedTable) {
      router.push("/dashboard")
    }
  }, [router, selectedBase, selectedTable])

  const handleSave = async () => {
    if (!selectedBase || !selectedTable || selectedFields.length === 0) {
      setError("Please add at least one field")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const form = await createForm({
        baseId: selectedBase.id,
        tableId: selectedTable.id,
        baseName: selectedBase.name,
        tableName: selectedTable.name,
        name: `${selectedBase.name} - ${selectedTable.name}`,
        description: "",
        fields: selectedFields,
        rules,
      })
      router.push(`/form/${form.formId}`)
    } catch {
      setError("Failed to save form")
    } finally {
      setSaving(false)
    }
  }

  if (!selectedBase || !selectedTable) {
    return null
  }

  return (
    <main className="min-h-screen bg-muted p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Form Builder</h1>
              <p className="text-sm text-muted-foreground">
                {selectedBase.name} / {selectedTable.name}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving || selectedFields.length === 0}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Form
          </Button>
        </div>

        {error && (
          <Card className="mb-4 border-destructive">
            <CardContent className="pt-4">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {/* Field Selector */}
          <div className="md:col-span-1">
            <FieldSelector
              fields={availableFields}
              selectedFieldIds={selectedFields.map((f) => f.fieldId)}
              onAddField={addField}
            />
          </div>

          {/* Form Configuration */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Form Fields</CardTitle>
                <CardDescription>Configure how each field appears in the form</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add fields from the left panel</p>
                ) : (
                  selectedFields.map((field) => (
                    <FieldConfigCard key={field.fieldId} field={field} onUpdate={updateField} onRemove={removeField} />
                  ))
                )}
              </CardContent>
            </Card>

            <ConditionsEditor
              fields={selectedFields}
              rules={rules}
              onAddRule={addRule}
              onUpdateRule={updateRule}
              onRemoveRule={removeRule}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
