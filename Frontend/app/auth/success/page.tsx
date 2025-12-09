"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("auth_token", token);
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  }, [searchParams, router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-muted-foreground">
          Please wait while we log you in.
        </p>
      </div>
    </div>
  );
}