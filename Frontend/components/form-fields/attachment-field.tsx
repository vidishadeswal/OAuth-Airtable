"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface AttachmentFieldProps {
  id: string
  label: string
  required: boolean
  value: File[]
  onChange: (files: File[]) => void
  error?: string
}

export function AttachmentField({ id, label, required, value, onChange, error }: AttachmentFieldProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    onChange([...value, ...files])
  }

  const handleRemove = (index: number) => {
    const newFiles = [...value]
    newFiles.splice(index, 1)
    onChange(newFiles)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input id={id} type="file" multiple onChange={handleFileChange} className={error ? "border-destructive" : ""} />
      {value.length > 0 && (
        <div className="space-y-1">
          {value.map((file, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="truncate">{file.name}</span>
              <Button variant="ghost" size="sm" onClick={() => handleRemove(index)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
