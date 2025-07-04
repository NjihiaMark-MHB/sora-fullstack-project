"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/app-zod-schemas/auth";
import type { inferredLoginSchema } from "@/app-zod-schemas/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { useTRPCClient } from "@/utils/trpc";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userNotFound, setUserNotFound] = useState(false);
  const trpcClient = useTRPCClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<inferredLoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  // Custom function to check if user exists by email
  const checkUserExists: (email: string) => Promise<boolean> = async (
    email: string
  ) => {
    const user = await trpcClient.user.findByEmail.query({ email });
    return user.exists;
  };

  // Use the useMutation hook for login
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: inferredLoginSchema) => {
      try {
        // First check if the user exists
        const userExists = await checkUserExists(data.email);

        if (!userExists) {
          throw new Error("No account found");
        }

        const result = await signIn("resend", {
          redirect: false,
          email: data.email,
        });

        if (result?.error) {
          throw new Error("Invalid email or password");
        }

        return result;
      } catch (error) {
        // Check if it's a TRPC error related to the user not being found
        if (
          error instanceof Error &&
          (error.message.includes("No account found") ||
            error.message.includes("Failed to retrieve user"))
        ) {
          setUserNotFound(true);
          throw new Error(`No account found with email ${data.email}`);
        }
        // For other errors, just pass them through
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      setSuccessMessage(
        `We've sent a login link to ${variables.email}. Please check your inbox and click the link to sign in.`
      );
      setError("");
      setUserNotFound(false);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const onSubmit = handleSubmit((data) => {
    setError("");
    setSuccessMessage("");
    setUserNotFound(false);
    mutate(data);
  });

  // Function to handle Google sign-in
  const handleGoogleSignIn = async () => {
    setError("");
    setSuccessMessage("");
    setUserNotFound(false);
    try {
      await signIn("google", { redirectTo: "/" });
    } catch {
      setError("Failed to sign in with Google");
    }
  };

  return (
    <div className="flex w-full items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your email to access your drive
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-white bg-red-500 rounded-md">
                {error}
                {userNotFound && (
                  <div className="mt-2">
                    <span>{`Don't have an account?`} </span>
                    <Link href="/signup" className="underline font-medium">
                      Sign up here
                    </Link>
                  </div>
                )}
              </div>
            )}
            {successMessage && (
              <div className="p-3 text-sm text-white bg-green-500 rounded-md">
                {successMessage}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-6">
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isPending}
            >
              {isPending ? "Logging in..." : "Login with email"}
            </Button>

            {/* Google Sign-In Button */}
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
              Sign in with Google
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline text-primary">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
