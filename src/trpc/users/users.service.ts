import { db } from "@/database";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import type { User, NewUser } from "./schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import logger from "../logger";
import { TRPCError } from "@trpc/server";

class UsersService {
  private db: PostgresJsDatabase;

  constructor(database: PostgresJsDatabase) {
    this.db = database;
  }

  async createUser(user: NewUser) {
    try {
      const [newUser] = await this.db.insert(users).values(user).returning();
      return newUser;
    } catch (error) {
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

  async getUserByUUID(uuid: string) {
    try {
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.uuid, uuid));
      return user;
    } catch (error) {
      logger.error(
        { service: "UsersService - getUserByUUID" },
        error as string
      );
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Failed to retrieve user by UUID",
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

  async getUserById(id: number) {
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

  async updateUser(id: number, data: Partial<User>) {
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

  async deleteUser(id: number) {
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
