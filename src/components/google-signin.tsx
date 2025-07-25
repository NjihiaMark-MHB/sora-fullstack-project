"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

type GoogleSignInProps = {
  mode: "login" | "signup";
  onError?: (error: string) => void;
  onSuccess?: () => void;
};

export function GoogleSignIn({ mode, onError, onSuccess }: GoogleSignInProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      onSuccess?.();
      await signIn("google", { redirectTo: "/" });
    } catch {
      const errorMessage = "Failed to sign in with Google";
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const linkText = mode === "login" ? "Sign up" : "Login";
  const linkHref = mode === "login" ? "/signup" : "/login";
  const questionText =
    mode === "login" ? "Don't have an account?" : "Already have an account?";

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2 cursor-pointer"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="h-5 w-5"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
          <path fill="none" d="M1 1h22v22H1z" />
        </svg>
        {isLoading ? "Signing in..." : "Sign in with Google"}
      </Button>

      <div className="text-sm text-center text-muted-foreground">
        {questionText}{" "}
        <Link href={linkHref} className="underline text-primary">
          {linkText}
        </Link>
      </div>
    </>
  );
}
