import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/database";
import { users } from "@/trpc/users/schema";
import { accounts, sessions, verificationTokens } from "@/trpc/auth/schema";
import { eq } from "drizzle-orm";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { JWT } from "next-auth/jwt";

// Extend the built-in Session User type
declare module "next-auth" {
  interface User {
    role?: string | null;
    id?: string | null;
  }

  interface Session {
    user: {
      role?: string | null;
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null;
    sub: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? "user";
      }
      return token;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string));
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

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
