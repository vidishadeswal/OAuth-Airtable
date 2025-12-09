"use client"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
interface SelectOption {
  id: string
  name: string
  color?: string
}
interface SelectFieldProps {
  id: string
  label: string
  required: boolean
  multiple?: boolean
  options: SelectOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  error?: string
}
export function SelectField({ id, label, required, multiple, options, value, onChange, error }: SelectFieldProps) {
  if (multiple) {
    const selectedValues = Array.isArray(value) ? value : []
    const handleCheckChange = (optionId: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedValues, optionId])
      } else {
        onChange(selectedValues.filter((v) => v !== optionId))
      }
    }
    return (
      <div className="space-y-2">
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <Checkbox
                id={`${id}-${option.id}`}
                checked={selectedValues.includes(option.id)}
                onCheckedChange={(checked) => handleCheckChange(option.id, checked as boolean)}
              />
              <Label htmlFor={`${id}-${option.id}`} className="font-normal">
                {option.name}
              </Label>
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value as string} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}