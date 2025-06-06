import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least 1 uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least 1 lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least 1 special character",
    }),
});

export type inferredCreateUserSchema = z.infer<typeof createUserSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least 1 uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least 1 lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least 1 special character",
    }),
});

export type inferredLoginSchema = z.infer<typeof loginSchema>;
