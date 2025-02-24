import { Role } from "@prisma/client";
import NextAuth from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: Role;
    picture?: string | null;
    tokenCheckExpiration?: string;
    otpSessionId?: string;
    name: string | null;
    email: string;
    sub: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      name: string | null;
      email: string;
      image: string | null;
    },
    expires: string;
  }
}
