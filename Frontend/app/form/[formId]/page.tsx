"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle } from "lucide-react"
import { fetchForm, submitFormResponse, type FormSchema, type FormFieldConfig } from "@/lib/api"
import { TextField, SelectField, AttachmentField } from "@/components/form-fields"
import { evaluateConditions } from "@/lib/conditional-logic"

export default function FormViewerPage() {
  const params = useParams()
  const formId = params.formId as string

  const [form, setForm] = useState<FormSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchForm(formId)
      .then(setForm)
      .catch(() => setError("Failed to load form"))
      .finally(() => setLoading(false))
  }, [formId])

  const updateField = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    // Clear error when field is updated
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldId]
        return next
      })
    }
  }

  const validateForm = (): boolean => {
    if (!form) return false

    const newErrors: Record<string, string> = {}

    for (const field of form.fields) {
      if (field.required) {
        const value = formData[field.fieldId]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.fieldId] = "This field is required"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setSubmitting(true)
    setError(null)

    try {
      await submitFormResponse(formId, formData)
      setSubmitted(true)
    } catch {
      setError("Failed to submit form")
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormFieldConfig) => {
    const value = formData[field.fieldId]
    const fieldError = errors[field.fieldId]

    switch (field.fieldType) {
      case "singleLineText":
        return (
          <TextField
            key={field.fieldId}
            id={field.fieldId}
            label={field.label}
            required={field.required}
            value={(value as string) || ""}
            onChange={(v) => updateField(field.fieldId, v)}
            error={fieldError}
          />
        )
      case "multilineText":
        return (
          <TextField
            key={field.fieldId}
            id={field.fieldId}
            label={field.label}
            required={field.required}
            multiline
            value={(value as string) || ""}
            onChange={(v) => updateField(field.fieldId, v)}
            error={fieldError}
          />
        )
      case "singleSelect":
        return (
          <SelectField
            key={field.fieldId}
            id={field.fieldId}
            label={field.label}
            required={field.required}
            options={field.options || []}
            value={(value as string) || ""}
            onChange={(v) => updateField(field.fieldId, v)}
            error={fieldError}
          />
        )
      case "multipleSelect":
        return (
          <SelectField
            key={field.fieldId}
            id={field.fieldId}
            label={field.label}
            required={field.required}
            multiple
            options={field.options || []}
            value={(value as string[]) || []}
            onChange={(v) => updateField(field.fieldId, v)}
            error={fieldError}
          />
        )
      case "attachment":
        return (
          <AttachmentField
            key={field.fieldId}
            id={field.fieldId}
            label={field.label}
            required={field.required}
            value={(value as File[]) || []}
            onChange={(v) => updateField(field.fieldId, v)}
            error={fieldError}
          />
        )
      default:
        return null
    }
  }

  // Check conditional logic
  const showForm = form ? evaluateConditions(form.rules, formData, form.fields) : true

  if (loading) {
    return (
      <main className="min-h-screen bg-muted p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    )
  }

  if (error && !form) {
    return (
      <main className="min-h-screen bg-muted p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-muted p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground">Your response has been submitted successfully.</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted p-4">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Form</CardTitle>
            <CardDescription>Please fill out the form below</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <p className="text-destructive mb-4">{error}</p>}
            {showForm ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {form?.fields.map(renderField)}
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Submit
                </Button>
              </form>
            ) : (
              <p className="text-muted-foreground text-center">
                Form conditions not met. Please check the required fields.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
