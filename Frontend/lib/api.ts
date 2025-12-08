// API client for communicating with the backend

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface ApiError {
  message: string;
  status: number;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(typeof options.headers === "object" && options.headers !== null && !Array.isArray(options.headers) ? options.headers as Record<string, string> : {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If response is not JSON, try to get text
      try {
        errorMessage = await response.text();
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
    
    const error: ApiError = {
      message: errorMessage,
      status: response.status,
    };
    throw error;
  }

  return response.json();
}

// Auth
export function getLoginUrl(): Promise<string> {
  return fetchApi<{ oauthUrl: string }>("/auth/oauth-url").then(
    (data) => data.oauthUrl
  );
}

export function setAuthToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function getAuthToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("auth_token")
    : null;
}

export function clearAuthToken(): void {
  localStorage.removeItem("auth_token");
}

export async function getProfile(): Promise<{
  id: string;
  email: string;
  name?: string;
  profileImage?: string;
}> {
  return fetchApi("/auth/me");
}

export async function logoutUser(): Promise<void> {
  await fetchApi("/auth/logout", { method: "POST" });
  clearAuthToken();
}

// Airtable
export interface AirtableBase {
  id: string;
  name: string;
}

export interface AirtableTable {
  id: string;
  name: string;
}

export interface AirtableField {
  id: string;
  name: string;
  type:
    | "singleLineText"
    | "multilineText"
    | "singleSelect"
    | "multipleSelect"
    | "attachment"
    | string;
  options?: {
    choices?: { id: string; name: string; color?: string }[];
  };
}

export async function fetchBases(): Promise<AirtableBase[]> {
  const response = await fetchApi<{ bases: AirtableBase[] }>("/forms/airtable/bases");
  return response.bases || [];
}

export async function fetchTables(baseId: string): Promise<AirtableTable[]> {
  const response = await fetchApi<{ tables: AirtableTable[] }>(
    `/forms/airtable/bases/${baseId}/tables`
  );
  return response.tables || [];
}

export async function fetchFields(
  baseId: string,
  tableId: string
): Promise<AirtableField[]> {
  const response = await fetchApi<{ fields: AirtableField[] }>(
    `/forms/airtable/bases/${baseId}/tables/${tableId}/fields`
  );
  return response.fields || [];
}

// Forms
export interface FormFieldConfig {
  fieldId: string;
  fieldName: string;
  fieldType: string;
  label: string;
  required: boolean;
  options?: { id: string; name: string; color?: string }[];
}

export interface ConditionalRule {
  id: string;
  sourceFieldId: string;
  operator: "equals" | "notEquals" | "contains";
  value: string;
  logic: "AND" | "OR";
}

export interface FormSchema {
  formId: string;
  baseId: string;
  tableId: string;
  baseName?: string;
  tableName?: string;
  name?: string;
  description?: string;
  fields: FormFieldConfig[];
  rules: ConditionalRule[];
  createdAt?: string;
}

export interface FormResponse {
  submissionId: string;
  createdAt: string;
  data: Record<string, unknown>;
}

export async function createForm(
  form: Omit<FormSchema, "formId" | "createdAt">
): Promise<FormSchema> {
  // Transform frontend form structure to backend format
  const backendForm = {
    name: form.name || `${form.baseId} - ${form.tableId}`,
    description: form.description || "",
    airtableBaseId: form.baseId,
    airtableTableId: form.tableId,
    baseName: form.baseName || "",
    tableName: form.tableName || "",
    questions: form.fields.map((field) => {
      // Map conditional rules to backend format
      const fieldRules = form.rules.filter((r) => r.sourceFieldId === field.fieldId);
      let conditionalRules = null;
      
      if (fieldRules.length > 0) {
        conditionalRules = {
          logic: fieldRules[0].logic || "AND",
          conditions: fieldRules.map((rule) => ({
            questionKey: rule.sourceFieldId,
            operator: rule.operator,
            value: rule.value,
          })),
        };
      }

      return {
        questionKey: field.fieldId,
        fieldId: field.fieldId,
        label: field.label,
        type: field.fieldType,
        required: field.required,
        conditionalRules,
        selectOptions: field.options?.map((opt) => opt.name) || [],
      };
    }),
  };

  const response = await fetchApi<any>("/forms", {
    method: "POST",
    body: JSON.stringify(backendForm),
  });

  // Transform backend response to frontend format
  return {
    formId: response._id || response.id,
    baseId: response.airtableBaseId,
    tableId: response.airtableTableId,
    baseName: response.baseName,
    tableName: response.tableName,
    name: response.name,
    description: response.description,
    fields: response.questions?.map((q: any) => ({
      fieldId: q.fieldId,
      fieldName: q.label,
      fieldType: q.type,
      label: q.label,
      required: q.required,
      options: q.selectOptions?.map((opt: string) => ({ id: opt, name: opt })) || [],
    })) || [],
    rules: response.questions?.flatMap((q: any) => 
      q.conditionalRules ? [{
        id: q.fieldId,
        sourceFieldId: q.conditionalRules.conditions[0]?.questionKey || q.fieldId,
        operator: q.conditionalRules.conditions[0]?.operator || "equals",
        value: q.conditionalRules.conditions[0]?.value || "",
        logic: q.conditionalRules.logic || "AND",
      }] : []
    ) || [],
  };
}

export async function fetchForm(formId: string): Promise<FormSchema> {
  const response = await fetchApi<any>(`/forms/${formId}`);
  
  // Transform backend response to frontend format
  return {
    formId: response._id || response.id,
    baseId: response.airtableBaseId,
    tableId: response.airtableTableId,
    baseName: response.baseName,
    tableName: response.tableName,
    name: response.name,
    description: response.description || "",
    fields: response.questions?.map((q: any) => ({
      fieldId: q.fieldId,
      fieldName: q.label,
      fieldType: q.type,
      label: q.label,
      required: q.required || false,
      options: q.selectOptions?.map((opt: string) => ({ id: opt, name: opt })) || [],
    })) || [],
    rules: response.questions?.flatMap((q: any) => 
      q.conditionalRules ? [{
        id: q.fieldId,
        sourceFieldId: q.conditionalRules.conditions[0]?.questionKey || q.fieldId,
        operator: q.conditionalRules.conditions[0]?.operator || "equals",
        value: q.conditionalRules.conditions[0]?.value || "",
        logic: q.conditionalRules.logic || "AND",
      }] : []
    ) || [],
  };
}

export async function listForms(): Promise<FormSchema[]> {
  const response = await fetchApi<{ forms: any[] }>("/forms");
  return (response.forms || []).map((form: any) => ({
    formId: form._id || form.id,
    baseId: form.airtableBaseId,
    tableId: form.airtableTableId,
    baseName: form.baseName,
    tableName: form.tableName,
    name: form.name,
    description: form.description || "",
    fields: [],
    rules: [],
  }));
}

export async function updateForm(
  formId: string,
  form: Partial<FormSchema>
): Promise<FormSchema> {
  return fetchApi<FormSchema>(`/forms/${formId}`, {
    method: "PUT",
    body: JSON.stringify(form),
  });
}

export async function deleteForm(formId: string): Promise<void> {
  await fetchApi(`/forms/${formId}`, { method: "DELETE" });
}

export async function submitFormResponse(
  formId: string,
  data: Record<string, unknown>
): Promise<{ id: string }> {
  const response = await fetchApi<{ responseId: string; airtableRecordId: string }>(
    `/forms/${formId}/submit`,
    {
      method: "POST",
      body: JSON.stringify({ answers: data }),
    }
  );
  return { id: response.responseId || response.airtableRecordId };
}

export async function fetchFormResponses(
  formId: string
): Promise<FormResponse[]> {
  const response = await fetchApi<{ responses: any[] }>(`/forms/${formId}/responses`);
  return (response.responses || []).map((r: any) => ({
    submissionId: r._id || r.id,
    createdAt: r.createdAt,
    data: r.answers || {},
  }));
}

export async function evaluateConditionalLogic(
  formId: string,
  answersSoFar: Record<string, unknown>
): Promise<string[]> {
  const result = await fetchApi<{ visibleQuestionKeys: string[] }>(
    `/forms/${formId}/evaluate-logic`,
    {
      method: "POST",
      body: JSON.stringify({ answersSoFar }),
    }
  );
  return result.visibleQuestionKeys || [];
}
