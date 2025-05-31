import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { db } from "@/database";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { users } from "./schema";

export const usersRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z
          .string()
          .min(8, { message: "Password must be at least 8 characters long" })
          .regex(/[A-Z]/, {
            message: "Password must contain at least 1 uppercase letter",
          })
          .regex(/[a-z]/, {
            message: "Password must contain at least 1 lowercase letter",
          })
          .regex(/[0-9]/, {
            message: "Password must contain at least 1 number",
          })
          .regex(/[^A-Za-z0-9]/, {
            message: "Password must contain at least 1 special character",
          }),
      })
    )
    .mutation(async ({ input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email));
      if (existingUser.length > 0) {
        throw new Error("Email already in use");
      }
      await db.insert(users).values({
        name: input.name,
        email: input.email,
        password: hashedPassword,
      });
      return { success: true };
    }),
});
