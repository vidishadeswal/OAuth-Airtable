"use client"
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { AirtableBase, AirtableTable, AirtableField, FormFieldConfig, ConditionalRule } from "./api"
interface AppState {
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void
  selectedBase: AirtableBase | null
  selectedTable: AirtableTable | null
  setSelectedBase: (base: AirtableBase | null) => void
  setSelectedTable: (table: AirtableTable | null) => void
  availableFields: AirtableField[]
  setAvailableFields: (fields: AirtableField[]) => void
  selectedFields: FormFieldConfig[]
  setSelectedFields: (fields: FormFieldConfig[]) => void
  addField: (field: AirtableField) => void
  removeField: (fieldId: string) => void
  updateField: (fieldId: string, updates: Partial<FormFieldConfig>) => void
  rules: ConditionalRule[]
  setRules: (rules: ConditionalRule[]) => void
  addRule: (rule: ConditionalRule) => void
  removeRule: (ruleId: string) => void
  updateRule: (ruleId: string, updates: Partial<ConditionalRule>) => void
  resetFormBuilder: () => void
}
const AppContext = createContext<AppState | null>(null)
export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false)
  const [selectedBase, setSelectedBase] = useState<AirtableBase | null>(null)
  const [selectedTable, setSelectedTable] = useState<AirtableTable | null>(null)
  const [availableFields, setAvailableFields] = useState<AirtableField[]>([])
  const [selectedFields, setSelectedFields] = useState<FormFieldConfig[]>([])
  const [rules, setRules] = useState<ConditionalRule[]>([])
  const addField = useCallback((field: AirtableField) => {
    const config: FormFieldConfig = {
      fieldId: field.id,
      fieldName: field.name,
      fieldType: field.type,
      label: field.name,
      required: false,
      options: field.options?.choices,
    }
    setSelectedFields((prev) => [...prev, config])
  }, [])
  const removeField = useCallback((fieldId: string) => {
    setSelectedFields((prev) => prev.filter((f) => f.fieldId !== fieldId))
  }, [])
  const updateField = useCallback((fieldId: string, updates: Partial<FormFieldConfig>) => {
    setSelectedFields((prev) => prev.map((f) => (f.fieldId === fieldId ? { ...f, ...updates } : f)))
  }, [])
  const addRule = useCallback((rule: ConditionalRule) => {
    setRules((prev) => [...prev, rule])
  }, [])
  const removeRule = useCallback((ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId))
  }, [])
  const updateRule = useCallback((ruleId: string, updates: Partial<ConditionalRule>) => {
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)))
  }, [])
  const resetFormBuilder = useCallback(() => {
    setSelectedFields([])
    setRules([])
    setAvailableFields([])
  }, [])
  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setAuthenticated,
        selectedBase,
        selectedTable,
        setSelectedBase,
        setSelectedTable,
        availableFields,
        setAvailableFields,
        selectedFields,
        setSelectedFields,
        addField,
        removeField,
        updateField,
        rules,
        setRules,
        addRule,
        removeRule,
        updateRule,
        resetFormBuilder,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppState must be used within AppProvider")
  }
  return context
}