"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import type { ConditionalRule, FormFieldConfig } from "@/lib/api"

interface ConditionsEditorProps {
  fields: FormFieldConfig[]
  rules: ConditionalRule[]
  onAddRule: (rule: ConditionalRule) => void
  onUpdateRule: (ruleId: string, updates: Partial<ConditionalRule>) => void
  onRemoveRule: (ruleId: string) => void
}

export function ConditionsEditor({ fields, rules, onAddRule, onUpdateRule, onRemoveRule }: ConditionsEditorProps) {
  const handleAddRule = () => {
    const newRule: ConditionalRule = {
      id: `rule-${Date.now()}`,
      sourceFieldId: fields[0]?.fieldId || "",
      operator: "equals",
      value: "",
      logic: "AND",
    }
    onAddRule(newRule)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Conditional Logic</CardTitle>
          <Button size="sm" variant="outline" onClick={handleAddRule} disabled={fields.length === 0}>
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conditional rules configured</p>
        ) : (
          rules.map((rule, index) => (
            <div key={rule.id} className="space-y-2 p-3 border rounded-md">
              {index > 0 && (
                <Select
                  value={rule.logic}
                  onValueChange={(value: "AND" | "OR") => onUpdateRule(rule.id, { logic: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  value={rule.sourceFieldId}
                  onValueChange={(value) => onUpdateRule(rule.id, { sourceFieldId: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.fieldId} value={field.fieldId}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={rule.operator}
                  onValueChange={(value: "equals" | "notEquals" | "contains") =>
                    onUpdateRule(rule.id, { operator: value })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="notEquals">Not Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={rule.value}
                  onChange={(e) => onUpdateRule(rule.id, { value: e.target.value })}
                  placeholder="Value"
                  className="w-32"
                />
                <Button variant="ghost" size="sm" onClick={() => onRemoveRule(rule.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
