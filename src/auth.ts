// Auth providers
import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

// Database and ORM
import { db } from "@/database";
import { eq } from "drizzle-orm";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

// Schema
import { users } from "@/trpc/users/schema";
import { accounts, sessions, verificationTokens } from "@/trpc/auth/schema";

// Utilities
import { verifyPassword } from "./utils/webcrypto";

// This empty import is needed for the module augmentation below
import type {} from "next-auth/jwt";

/**
 * Type Extensions for NextAuth
 *
 * These module augmentations extend the built-in types from NextAuth
 * to include custom properties like user roles.
 */

/**
 * Extend the built-in User type to include role information
 */
declare module "next-auth" {
  interface User {
    role?: string | null;
    id?: string | null;
  }

  /**
   * Extend the Session type to include user role in the session
   */
  interface Session {
    user: {
      role?: string | null;
      id: string;
    } & DefaultSession["user"];
  }
}

/**
 * Extend the JWT type to include role information in the token
 */
declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null;
    sub: string;
  }
}

/**
 * NextAuth configuration
 *
 * This exports the NextAuth handlers, signIn, signOut, and auth functions
 * configured with our custom adapter, callbacks, and providers.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  // Configure the database adapter
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

  // Use JWT for session management
  session: { strategy: "jwt" },

  // Custom callbacks for session and JWT handling
  callbacks: {
    /**
     * Add user ID and role to the session from the token
     */
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    },

    /**
     * Add user role to the JWT token
     */
    async jwt({ token, user }) {
      if (user) {
        // Default to "user" role if none is specified
        token.role = user.role ?? "user";
      }
      return token;
    },
  },

  // Authentication providers
  providers: [
    // Google OAuth provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // Email/Password credentials provider
    Credentials({
      credentials: { email: {}, password: {} },

      /**
       * Authorize user with email and password
       *
       * @param credentials - The credentials provided by the user
       * @returns The user object if authentication succeeds, null otherwise
       */
      authorize: async (credentials) => {
        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) return null;

        // Find user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string));

        // Verify user exists and has a password
        if (!user || !user.password) return null;

        // Verify password using Argon2
        const isValid = await verifyPassword(
          credentials.password as string,
          user.password
        );

        // Return null if password is invalid
        if (!isValid) return null;

        // Return user object for successful authentication
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});
