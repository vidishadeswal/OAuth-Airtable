"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
interface TextFieldProps {
  id: string
  label: string
  required: boolean
  multiline?: boolean
  value: string
  onChange: (value: string) => void
  error?: string
}
export function TextField({ id, label, required, multiline, value, onChange, error }: TextFieldProps) {
  const Component = multiline ? Textarea : Input
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Component
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}