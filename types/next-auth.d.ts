// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Credentials {
    email: string;
    password: string;
    rememberMe: string; 
  }

  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
    rememberMe: boolean
  }

  interface User {
    id: string;
    rememberMe?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    rememberMe?: boolean
    provider?: string;
    exp?: number
  }
}
