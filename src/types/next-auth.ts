import "next-auth";
import "next-auth/jwt";
declare module "next-auth" {
  interface User {
    id?: string;
    username?: string | null;
    email?: string | null;
    token?: string;
    emailVerified: Date | null;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
    };
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username: string;
    token?: string;
  }
}