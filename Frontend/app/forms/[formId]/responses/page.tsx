"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Loader2 } from "lucide-react"
import { fetchFormResponses, fetchForm, getAuthToken, type FormResponse, type FormSchema } from "@/lib/api"

export default function ResponsesPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.formId as string

  const [form, setForm] = useState<FormSchema | null>(null)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.push("/")
      return
    }

    Promise.all([fetchForm(formId), fetchFormResponses(formId)])
      .then(([formData, responsesData]) => {
        setForm(formData)
        setResponses(responsesData)
      })
      .catch(() => setError("Failed to load responses"))
      .finally(() => setLoading(false))
  }, [formId, router])

  const getPreview = (data: Record<string, unknown>): string => {
    const values = Object.values(data)
    const preview = values
      .filter((v) => typeof v === "string")
      .slice(0, 2)
      .join(", ")
    return preview.length > 50 ? preview.slice(0, 50) + "..." : preview || "No preview"
  }

  const getFieldLabel = (fieldId: string): string => {
    const field = form?.fields.find((f) => f.fieldId === fieldId)
    return field?.label || fieldId
  }

  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.join(", ")
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value)
    }
    return String(value || "-")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-muted p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Form Responses</h1>
            <p className="text-sm text-muted-foreground">{responses.length} responses</p>
          </div>
        </div>

        {error && (
          <Card className="mb-4 border-destructive">
            <CardContent className="pt-4">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Responses</CardTitle>
            <CardDescription>Click on a response to view details</CardDescription>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No responses yet</p>
            ) : (
              <div className="space-y-2">
                {responses.map((response) => (
                  <div
                    key={response.submissionId}
                    className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedResponse(response)}
                  >
                    <div>
                      <p className="text-sm font-medium">{response.submissionId}</p>
                      <p className="text-xs text-muted-foreground">{getPreview(response.data)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(response.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Detail Dialog */}
        <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Response Details</DialogTitle>
            </DialogHeader>
            {selectedResponse && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Submitted: {new Date(selectedResponse.createdAt).toLocaleString()}
                </div>
                <div className="space-y-3">
                  {Object.entries(selectedResponse.data).map(([fieldId, value]) => (
                    <div key={fieldId} className="border-b pb-2">
                      <p className="text-sm font-medium">{getFieldLabel(fieldId)}</p>
                      <p className="text-sm text-muted-foreground">{formatValue(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
