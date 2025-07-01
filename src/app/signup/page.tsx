"use client";

import type React from "react";
import { signIn } from "next-auth/react";
import { useState } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema
} from "@/app-zod-schemas/auth";
import type {inferredCreateUserSchema} from "@/app-zod-schemas/auth";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const trpc = useTRPC();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<inferredCreateUserSchema>({
    resolver: zodResolver(createUserSchema),
  });

  // Use the useMutation hook with the tRPC options
  const { mutate, isPending } = useMutation({
    ...trpc.user.register.mutationOptions(),
    onSuccess: async (_data, variables) => {
      const result = await signIn("resend", {
        redirect: false,
        email: variables.email,
      });
      if (result?.ok) {
        setSuccessMessage(`We've sent a login link to ${variables.email}. Please check your inbox and click the link to sign in.`);
        setError("");
      }
    },
    onError: (err) => {
      setError(err.message);
      console.error(err);
    },
  });

  const onSubmit = handleSubmit((data) => {
    setError("");
    setSuccessMessage("");

    mutate({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
    });
  });

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
          <CardDescription>
            Create an account to access your drive
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-white bg-red-500 rounded-md">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="p-3 text-sm text-white bg-green-500 rounded-md">
                {successMessage}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                aria-invalid={errors.firstName ? "true" : "false"}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                aria-invalid={errors.lastName ? "true" : "false"}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
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
              {isPending ? "Creating account..." : "Sign Up"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline text-primary">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
