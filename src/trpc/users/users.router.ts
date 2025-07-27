import { z } from "zod";
import { publicProcedure, router } from "../trpc";
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

  updateUser: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
          image: z.string().optional(),
          role: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const updatedUser = await usersService.updateUser(input.id, input.data);
        return { success: true, user: updatedUser };
      } catch (error) {
        console.log("updateUser ——", error);
        throw error;
      }
    }),

  deleteUser: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const deletedUser = await usersService.deleteUser(input.id);
        return { success: true, user: deletedUser };
      } catch (error) {
        console.log("deleteUser ——", error);
        throw error;
      }
    }),

  uploadAvatar: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        fileName: z.string(),
        fileData: z.string(), // base64 encoded file
        contentType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await usersService.uploadAvatar({
        userId: input.userId,
        fileName: input.fileName,
        fileData: input.fileData,
        contentType: input.contentType,
      });
    }),

  deleteAvatar: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        avatarUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      return await usersService.deleteAvatar({
        userId: input.userId,
        avatarUrl: input.avatarUrl,
      });
    }),
});
