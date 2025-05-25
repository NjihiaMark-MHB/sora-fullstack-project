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
        password: z.string().min(6),
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
