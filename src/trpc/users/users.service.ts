import { db } from "@/database";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import type { User } from "./schema";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import logger from "../logger";
import { TRPCError } from "@trpc/server";
import { hashPassword } from "../../utils/webcrypto";

class UsersService {
  private db: NeonHttpDatabase;

  constructor(database: NeonHttpDatabase) {
    this.db = database;
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
  }) {
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

      // Hash the password
      const hashedPassword = await hashPassword(userData.password);

      // Create the user with hashed password
      const [newUser] = await this.db
        .insert(users)
        .values({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
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
}

export const usersService = new UsersService(db);
