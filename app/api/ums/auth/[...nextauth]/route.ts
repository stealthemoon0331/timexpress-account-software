import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";
import pool from "@/lib/ums/database/connector";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        let connection;

        try {
          connection = await pool.getConnection();
          console.log("Successfully connected to the database");
          
          const [users] = (await connection.query(
            "SELECT id, name, username, email, password FROM admin WHERE email = ?",
            [credentials?.email]
          )) as [any[], any];

          if (!users || users.length === 0) {
            console.log("User not found");
            return null;
          }

          const user = users[0];

          // const passwordMatch = await bcrypt.compare(
          //   credentials?.password || "",
          //   user.password
          // );
          if(!user) return null;

          const passwordMatch = user.password == credentials?.password;

          console.log("user.password:", user.password);
          console.log("credentials?.password:", credentials?.password);
          console.log("passwordMatch:", passwordMatch);

          if (!passwordMatch) {
            console.log("Invalid password");
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            password: credentials?.password,
          };

        } catch (error) {
          console.error(error);
        }  finally {
          if (connection) connection.release(); 
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.systems = user.systems;
        // const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET || "your-secret-key";
        const jwtSecret = "your-secret-key";
        const jwtToken = jwt.sign(
          {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            password: user.password,
          },
          jwtSecret,
          { expiresIn: "1h" }
        );

        token.jwt = jwtToken;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token) {
        session.user.role = token.role;
        session.user.systems = token.systems;
        session.user.token = token.jwt;
      }
      console.log("✅ After Session Callback:", session);
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXT_PUBLIC_JWT_SECRET,
});

export { handler as GET, handler as POST };
