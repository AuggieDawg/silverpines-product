import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { prisma } from "@/lib/db/prisma";

function parseAuthorizedEmails() {
  return new Set(
    (process.env.AUTHORIZED_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "database",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    error: "/not-authorized",
  },

  callbacks: {
    async signIn({ user }) {
      const email = user.email?.trim().toLowerCase();

      if (!email) {
        return false;
      }

      const authorizedEmails = parseAuthorizedEmails();

      // Fail closed. If the allowlist is empty, nobody gets in.
      if (authorizedEmails.size === 0) {
        console.error("AUTHORIZED_EMAILS is empty. Refusing sign-in.");
        return false;
      }

      return authorizedEmails.has(email);
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }

      return session;
    },
  },
};