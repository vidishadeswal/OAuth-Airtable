"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import type { AirtableField } from "@/lib/api"
interface FieldSelectorProps {
  fields: AirtableField[]
  selectedFieldIds: string[]
  onAddField: (field: AirtableField) => void
}
const SUPPORTED_TYPES = ["singleLineText", "multilineText", "singleSelect", "multipleSelect", "attachment"]
export function FieldSelector({ fields, selectedFieldIds, onAddField }: FieldSelectorProps) {
  const availableFields = fields.filter((f) => !selectedFieldIds.includes(f.id) && SUPPORTED_TYPES.includes(f.type))
  const getFieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      singleLineText: "Short Text",
      multilineText: "Long Text",
      singleSelect: "Single Select",
      multipleSelect: "Multi Select",
      attachment: "Attachment",
    }
    return labels[type] || type
  }
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Available Fields</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {availableFields.length === 0 ? (
          <p className="text-sm text-muted-foreground">No more fields available</p>
        ) : (
          availableFields.map((field) => (
            <div key={field.id} className="flex items-center justify-between p-2 border rounded-md">
              <div>
                <p className="text-sm font-medium">{field.name}</p>
                <p className="text-xs text-muted-foreground">{getFieldTypeLabel(field.type)}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onAddField(field)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}