// Auth providers
import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

// Resend SDK for email sending
import { Resend as ResendClient } from "resend";

// Database and ORM
import { db } from "@/database";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

// Schema
import { users } from "@/trpc/users/schema";
import { accounts, sessions, verificationTokens } from "@/trpc/auth/schema";

// Custom Email Template
import { MagicLinkEmail } from "@/components/emails/magic-link-email";
import { render } from "@react-email/render";

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
      avatar?: string;
    } & DefaultSession["user"];
  }
}

/**
 * Export the Session type for use in other files
 */
export type Session = {
  user: {
    role?: string | null;
    id: string;
    avatar?: string;
  } & DefaultSession["user"];
};

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

  // Set session strategy to database for Magic Links and Google OAuth
  session: {
    strategy: "database",
    maxAge: 1 * 24 * 60 * 60, // 1 day
  },

  // Explicitly configure cookies to ensure proper session handling
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // Custom callbacks for session handling
  callbacks: {
    /**
     * Add user ID and role to the session from the user object
     * When using database sessions, we get the user object instead of token
     */
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id as string;
        session.user.role = user.role;
        session.user.avatar = user.image || "";
      }
      return session;
    },
  },

  // Authentication providers
  providers: [
    // Google OAuth provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // Resend email provider with custom email template
    Resend({
      from: "Sora <onboarding@resend.dev>",
      apiKey: process.env.AUTH_RESEND_KEY,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { host } = new URL(url);

        // Create a Resend client instance using the API key
        const resendClient = new ResendClient(provider.apiKey);

        // Render the email template to HTML
        const emailHtml = await render(MagicLinkEmail({ url, host }));

        // Send the email using the Resend SDK
        await resendClient.emails.send({
          to: identifier,
          from: provider.from!,
          subject: `Sign in to ${host}`,
          html: emailHtml,
        });
      },
    }),
  ],
});
