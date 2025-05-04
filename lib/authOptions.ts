import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing fields");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        if (!user.emailVerified) {
          throw new Error("Email is not verified");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          ...user,
          rememberMe: credentials?.rememberMe === "true",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.rememberMe = user.rememberMe;
      }

      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;

        const rememberMe = account.rememberMe ?? false;
        const now = Math.floor(Date.now() / 1000);
        token.exp = rememberMe
          ? now + 60 * 60 * 24 * 30 // 30 days
          : now + 60 * 60 * 2; // 2 hours
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id;
        session.rememberMe = token.rememberMe ?? false;
        session.accessToken = token.accessToken;
      }

      return session;
    },
    async signIn({ user, account }) {
      if (!user?.email) return false;

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      const trialPlan = await prisma.plan.findUnique({
        where: { id: "free-trial" },
      });

      const now = new Date();
      const expires = new Date();
      expires.setDate(now.getDate() + Number(process.env.TRIAL_DURATION));

      if (!existingUser) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            plan: { connect: { id: trialPlan?.id } },
            planActivatedAt: now,
            planExpiresAt: expires,
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            plan: { connect: { id: trialPlan?.id } },
            planActivatedAt: now,
            planExpiresAt: expires,
          },
        });
      }

      if (account?.type === "oauth" && existingUser) {
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {},
          create: {
            userId: existingUser.id,
            type: "oauth",
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        });
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
