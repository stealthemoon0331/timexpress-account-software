

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

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

        if (!user || !user.password) throw new Error("User not found");
        if (!user.emailVerified) throw new Error("Email is not verified");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        if (!isValid) throw new Error("Invalid credentials");

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
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // On login
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.rememberMe = user.rememberMe;
      }

      // On update call (from update() client function)
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
        token.picture = session.image;
      }

      // Handle "remember me" token expiration
      if (account) {
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
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.rememberMe = token.rememberMe ?? false;
        session.accessToken = token.accessToken;
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      if (!user?.email) return false;

      const now = new Date();
      const expires = new Date();
      expires.setDate(now.getDate() + Number(process.env.TRIAL_DURATION));

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      const trialPlan = await prisma.plan.findUnique({
        where: { id: "free-trial" },
      });


      if (!existingUser) {

        // New user: create user + trial
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: new Date(),
            plan: trialPlan ? { connect: { id: trialPlan.id } } : undefined,
            planActivatedAt: now,
            planExpiresAt: expires,
            lastLoginAt: now,
            account: account
              ? {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    refresh_token: account.refresh_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    session_state: account.session_state,
                  },
                }
              : undefined,
            planExpired: 0
          },
        });
      } else {
        // Existing user: update login time
        await prisma.user.update({
          where: { email: user.email },
          data: { lastLoginAt: now },
        });

        // Link OAuth account if it's not already linked
        if (account?.provider && account?.providerAccountId) {
          const existingAccount = await prisma.account.findFirst({
            where: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          });

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }
        }
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
