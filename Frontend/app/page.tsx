"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLoginUrl, setAuthToken, getAuthToken } from "@/lib/api";
import { useAppState } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthenticated } = useAppState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for token in URL (after OAuth redirect)
    const token = searchParams.get("token");
    if (token) {
      setAuthToken(token);
      setAuthenticated(true);
      router.push("/dashboard");
      return;
    }

    // Check for existing token
    const existingToken = getAuthToken();
    if (existingToken) {
      setAuthenticated(true);
      router.push("/dashboard");
    }
  }, [searchParams, router, setAuthenticated]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const loginUrl = await getLoginUrl();
      window.location.href = loginUrl;
    } catch (error) {
      console.error("Failed to get login URL:", error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Airtable Form Builder</CardTitle>
          <CardDescription>
            Connect your Airtable account to create custom forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? "Redirecting..." : "Login with Airtable"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
