import { generateUniqueKey, uploadToS3 } from "@/lib/s3-utils";
import { TRPCError } from "@trpc/server";
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
      // Server-side validation after buffer creation
      if (!input.contentType.startsWith("image/")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid file type",
        });
      }

      // Convert base64 to buffer first
      const buffer = Buffer.from(input.fileData, "base64");

      if (buffer.length > 5 * 1024 * 1024) {
        // 5MB limit
        throw new TRPCError({ code: "BAD_REQUEST", message: "File too large" });
      }

      // Generate unique key for avatar
      const key = generateUniqueKey(input.fileName, `avatars/${input.userId}/`);

      // Upload directly to S3
      const result = await uploadToS3({
        key,
        body: buffer,
        contentType: input.contentType,
        metadata: {
          userId: input.userId,
          uploadedAt: new Date().toISOString(),
        },
      });

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload avatar",
        });
      }

      // Update user record with new avatar URL
      await usersService.updateUser(input.userId, {
        image: result.url,
      });

      return {
        success: true,
        avatarUrl: result.url,
        key: result.key,
      };
    }),
});
