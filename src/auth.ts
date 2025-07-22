import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { connectDb } from "./lib/mongodb";
import { Account } from "./app/model";
import mongoose from "mongoose";

const handler = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 3600,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials || {};

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/signin`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            },
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Sign-in failed");
          }

          // Decode the token to extract user information
          const decodedToken = jwt.decode(data.token) as {
            id: string;
            email: string;
            username: string;
          };

          if (
            !decodedToken ||
            !decodedToken.id ||
            !decodedToken.email ||
            !decodedToken.username
          ) {
            throw new Error("Invalid token data");
          }

          // Return a valid User object with emailVerified
          return {
            id: decodedToken.id,
            email: decodedToken.email,
            username: decodedToken.username,
            token: data.token,
            emailVerified: null, // Add this field to match the User type
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Sign-in failed";
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile) {
        try {
          await connectDb();

          // Check if account exists by providerAccountId
          const existingAccount = await Account.findOne({
            email: profile.email,
          });

          if (existingAccount) {
            user.id = existingAccount._id.toString();
          } else {
            const newUserId = new mongoose.Types.ObjectId();

            await Account.create({
              userId: newUserId,
              provider: "google",
              providerAccountId: profile.sub || account.providerAccountId,
              type: "oauth",
              name: profile.name,
              email: profile.email,
              image: profile.picture || profile.image,
              googleId: profile.sub || account.providerAccountId,
            });

            user.id = newUserId.toString();
          }

          user.name = profile.name;
          user.email = profile.email;
          user.image = profile.picture || profile.image;

          return true;
        } catch (error) {
          console.error("Error saving Google auth data:", error);
          return true;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "credentials") {
          token.id = user.id as string;
          token.email = user.email as string;
          token.username = user.username as string;
          if (user.token) {
            token.accessToken = user.token;
          }
        }

        if (account?.provider === "google") {
          token.id = user.id as string;
          token.name = user.name;
          token.email = user.email as string;
          token.picture = user.image;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: String(token.id || ""),
          email: token.email || "",
          username: (token.username as string) || (token.name as string) || "",
          name: (token.name as string) || "",
          image: (token.picture as string) || "",
          emailVerified: null,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
  trustHost:true,
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : undefined
      }
    }
  }
});

export const {
  auth,
  handlers: { GET, POST },
} = handler;
