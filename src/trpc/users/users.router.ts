import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { usersService } from "./users.service";

export const usersRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      await usersService.createUser(input);
      return { success: true };
    }),

  findByEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ input }) => {
      try {
        const user = await usersService.getUserByEmail(input.email);
        return { exists: !!user, user };
      } catch (error) {
        console.log("findByEmail ——", error);
        return { exists: false, user: null };
      }
    }),
});
