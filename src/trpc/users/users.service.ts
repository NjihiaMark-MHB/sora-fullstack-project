import { db } from "@/database";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import type { User } from "./schema";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import logger from "../logger";
import { TRPCError } from "@trpc/server";
import { generateUniqueKey, uploadToS3, deleteFromS3 } from "@/lib/s3-utils";

class UsersService {
  private db: NeonHttpDatabase;

  constructor(database: NeonHttpDatabase) {
    this.db = database;
  }

  async createUser(userData: { name: string; email: string }) {
    try {
      // Check if user with this email already exists
      const existingUser = await this.db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already in use",
        });
      }

      // Create the user with hashed password
      const [newUser] = await this.db
        .insert(users)
        .values({
          name: userData.name,
          email: userData.email,
        })
        .returning();

      return JSON.stringify(newUser);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error; // Re-throw TRPC errors
      }
      logger.error({ service: "UsersService - createUser" }, error as string);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user",
      });
    }
  }

  async getUsers() {
    try {
      return await this.db.select().from(users);
    } catch (error) {
      logger.error({ service: "UsersService - getUsers" }, error as string);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve users",
      });
    }
  }

  async getUserByEmail(email: string) {
    try {
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return user;
    } catch (error) {
      logger.error(
        { service: "UsersService - getUserByEmail" },
        error as string
      );
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Failed to retrieve user by email",
      });
    }
  }

  async getUserById(id: string) {
    try {
      const [user] = await this.db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      logger.error({ service: "UsersService - getUserById" }, error as string);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Failed to retrieve user by ID",
      });
    }
  }

  async updateUser(id: string, data: Partial<User>) {
    try {
      const [updatedUser] = await this.db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      logger.error({ service: "UsersService - updateUser" }, error as string);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user",
      });
    }
  }

  async deleteUser(id: string) {
    try {
      const [deletedUser] = await this.db
        .delete(users)
        .where(eq(users.id, id))
        .returning();
      return deletedUser;
    } catch (error) {
      logger.error({ service: "UsersService - deleteUser" }, error as string);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Failed to delete user",
      });
    }
  }

  async uploadAvatar({
    userId,
    fileName,
    fileData,
    contentType,
  }: {
    userId: string;
    fileName: string;
    fileData: string;
    contentType: string;
  }) {
    try {
      // Server-side validation
      if (!contentType.startsWith("image/")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid file type",
        });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(fileData, "base64");

      if (buffer.length > 5 * 1024 * 1024) {
        // 5MB limit
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "File too large" 
        });
      }

      // Generate unique key for avatar
      const key = generateUniqueKey(fileName, `avatars/${userId}/`);

      // Upload directly to S3
      const result = await uploadToS3({
        key,
        body: buffer,
        contentType,
        metadata: {
          userId,
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
      const updatedUser = await this.updateUser(userId, {
        image: result.url,
      });

      return {
        success: true,
        avatarUrl: result.url,
        key: result.key,
        user: updatedUser,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error; // Re-throw TRPC errors
      }
      logger.error({ service: "UsersService - uploadAvatar" }, error as string);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to upload avatar",
      });
    }
   }

   async deleteAvatar({
     userId,
     avatarUrl,
   }: {
     userId: string;
     avatarUrl: string;
   }) {
     try {
       // Check if it's a Google avatar URL
       const isGoogleAvatar = avatarUrl.includes('googleusercontent.com');
       
       if (isGoogleAvatar) {
         // For Google avatars, just reset the user's image to null
         const updatedUser = await this.updateUser(userId, {
           image: null,
         });
         
         return {
           success: true,
           message: 'Google avatar removed successfully',
           user: updatedUser,
         };
       } else {
         // For S3 avatars, extract the key and delete from S3
         const s3UrlPattern = /https:\/\/[^.]+\.s3\.amazonaws\.com\/(.*)/;
         const match = avatarUrl.match(s3UrlPattern);
         
         if (!match || !match[1]) {
           throw new TRPCError({
             code: 'BAD_REQUEST',
             message: 'Invalid S3 avatar URL format',
           });
         }
         
         const s3Key = match[1];
         
         // Delete from S3 first
         await deleteFromS3(s3Key);
         
         // Then reset the user's image to null
         const updatedUser = await this.updateUser(userId, {
           image: null,
         });
         
         return {
           success: true,
           message: 'S3 avatar deleted successfully',
           user: updatedUser,
           deletedKey: s3Key,
         };
       }
     } catch (error) {
       if (error instanceof TRPCError) {
         throw error; // Re-throw TRPC errors
       }
       logger.error({ service: 'UsersService - deleteAvatar' }, error as string);
       throw new TRPCError({
         code: 'INTERNAL_SERVER_ERROR',
         message: 'Failed to delete avatar',
       });
     }
   }
 }

export const usersService = new UsersService(db);
