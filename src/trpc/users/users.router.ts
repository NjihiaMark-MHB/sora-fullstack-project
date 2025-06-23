import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { usersService } from "./users.service";

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
      await usersService.createUser(input);
      return { success: true };
    }),
});
