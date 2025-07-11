"use client";

import type { inferredLoginSchema } from "@/app-zod-schemas/auth";
import { loginSchema } from "@/app-zod-schemas/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleSignIn } from "@/components/google-signin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPCClient } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

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

            {/* Google Sign-In Component */}
            <GoogleSignIn
              mode="login"
              onError={(error) => {
                setError(error);
                setSuccessMessage("");
                setUserNotFound(false);
              }}
              onSuccess={() => {
                setError("");
                setSuccessMessage("");
                setUserNotFound(false);
              }}
            />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
