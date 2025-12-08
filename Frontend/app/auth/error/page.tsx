"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const error = searchParams.get("error");
  const description = searchParams.get("description");

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem authenticating with Airtable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm font-medium text-destructive mb-1">
                Error: {error}
              </p>
              {description && (
                <p className="text-sm text-muted-foreground">
                  {decodeURIComponent(description)}
                </p>
              )}
            </div>
          )}
          <Button
            onClick={() => router.push("/")}
            className="w-full"
            variant="outline"
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

