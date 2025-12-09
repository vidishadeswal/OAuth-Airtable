"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { GripVertical, Trash2 } from "lucide-react"
import type { FormFieldConfig } from "@/lib/api"
interface FieldConfigCardProps {
  field: FormFieldConfig
  onUpdate: (fieldId: string, updates: Partial<FormFieldConfig>) => void
  onRemove: (fieldId: string) => void
}
export function FieldConfigCard({ field, onUpdate, onRemove }: FieldConfigCardProps) {
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
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 cursor-grab text-muted-foreground">
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{field.fieldName}</p>
                <p className="text-xs text-muted-foreground">{getFieldTypeLabel(field.fieldType)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onRemove(field.fieldId)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`label-${field.fieldId}`} className="text-xs">
                Display Label
              </Label>
              <Input
                id={`label-${field.fieldId}`}
                value={field.label}
                onChange={(e) => onUpdate(field.fieldId, { label: e.target.value })}
                placeholder="Enter label"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`required-${field.fieldId}`}
                checked={field.required}
                onCheckedChange={(checked) => onUpdate(field.fieldId, { required: checked })}
              />
              <Label htmlFor={`required-${field.fieldId}`} className="text-sm">
                Required
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}