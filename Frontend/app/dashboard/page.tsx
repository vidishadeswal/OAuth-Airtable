"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, LogOut } from "lucide-react";
import {
  fetchBases,
  fetchTables,
  fetchFields,
  clearAuthToken,
  getAuthToken,
  type AirtableBase,
  type AirtableTable,
} from "@/lib/api";
import { useAppState } from "@/lib/store";

export default function DashboardPage() {
  const router = useRouter();
  const {
    selectedBase,
    selectedTable,
    setSelectedBase,
    setSelectedTable,
    setAvailableFields,
    resetFormBuilder,
  } = useAppState();

  const [bases, setBases] = useState<AirtableBase[]>([]);
  const [tables, setTables] = useState<AirtableTable[]>([]);
  const [loadingBases, setLoadingBases] = useState(true);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/");
      return;
    }

    // Fetch bases
    setLoadingBases(true);
    fetchBases()
      .then(setBases)
      .catch((err) => {
        if (err.status === 401) {
          clearAuthToken();
          router.push("/");
        } else {
          setError("Failed to load bases");
        }
      })
      .finally(() => setLoadingBases(false));
  }, [router]);

  // Fetch tables when base changes
  useEffect(() => {
    if (!selectedBase) {
      setTables([]);
      return;
    }

    setLoadingTables(true);
    setSelectedTable(null);
    fetchTables(selectedBase.id)
      .then(setTables)
      .catch(() => setError("Failed to load tables"))
      .finally(() => setLoadingTables(false));
  }, [selectedBase, setSelectedTable]);

  // Fetch fields when table changes
  useEffect(() => {
    if (!selectedTable || !selectedBase) {
      setAvailableFields([]);
      return;
    }

    setLoadingFields(true);
    fetchFields(selectedBase.id, selectedTable.id)
      .then(setAvailableFields)
      .catch(() => setError("Failed to load fields"))
      .finally(() => setLoadingFields(false));
  }, [selectedTable, selectedBase, setAvailableFields]);

  const handleBaseChange = (baseId: string) => {
    const base = bases.find((b) => b.id === baseId) || null;
    setSelectedBase(base);
    resetFormBuilder();
  };

  const handleTableChange = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId) || null;
    setSelectedTable(table);
  };

  const handleCreateForm = () => {
    router.push("/form-builder");
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-muted p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
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
            <CardTitle>Create a New Form</CardTitle>
            <CardDescription>
              Select an Airtable base and table to create a form
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Base Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Base</label>
              {loadingBases ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading bases...
                </div>
              ) : (
                <Select
                  value={selectedBase?.id || ""}
                  onValueChange={handleBaseChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a base" />
                  </SelectTrigger>
                  <SelectContent>
                    {bases.map((base) => (
                      <SelectItem key={base.id} value={base.id}>
                        {base.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Table Selection */}
            {selectedBase && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Table</label>
                {loadingTables ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading tables...
                  </div>
                ) : (
                  <Select
                    value={selectedTable?.id || ""}
                    onValueChange={handleTableChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Fields Preview */}
            {selectedTable && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Fields</label>
                {loadingFields ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading fields...
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Fields loaded. Click "Create Form" to configure your form.
                  </p>
                )}
              </div>
            )}

            {/* Create Form Button */}
            <Button
              onClick={handleCreateForm}
              disabled={!selectedBase || !selectedTable || loadingFields}
              className="w-full"
            >
              Create Form
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
