import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import jwt from "jsonwebtoken";
import { connectDb } from "./lib/mongodb";
import { Account } from "./app/model";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  plugins: [nextCookies()],

  session: {
    expiresIn: 60 * 60, // 1 hour
    updateAge: 60 * 15, // 15 minutes
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.providerId === "credential") {
        // Handle credential sign-in
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL!}/api/signin`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                password: (user as any).password // This would come from the sign-in form
              }),
            },
          );

          const result = await res.json();

          if (!res.ok) {
            throw new Error(result.message || "Sign-in failed");
          }

          // Decode the token to extract user information
          const decodedToken = jwt.decode(result.token) as {
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

          // Connect to database and find or create user
          await connectDb();

          let existingAccount = await Account.findOne({ email: decodedToken.email });

          if (!existingAccount) {
            const newUserId = new mongoose.Types.ObjectId();
            existingAccount = await Account.create({
              _id: newUserId,
              userId: newUserId,
              provider: "credentials",
              type: "credentials",
              email: decodedToken.email,
              username: decodedToken.username,
              accessToken: result.token,
            });
          }

          // Update user object
          user.id = existingAccount._id.toString();
          user.name = decodedToken.username;
          user.email = decodedToken.email;

          return true;
        } catch (error) {
          console.error("Credential sign-in error:", error);
          return false;
        }
      }

      if (account?.providerId === "google") {
        try {
          await connectDb();

          // Check if account exists by email
          const existingAccount = await Account.findOne({
            email: user.email,
          });

          if (!existingAccount) {
            const newUserId = new mongoose.Types.ObjectId();

            await Account.create({
              _id: newUserId,
              userId: newUserId,
              provider: "google",
              providerAccountId: account.accountId,
              type: "oauth",
              name: user.name,
              email: user.email,
              image: user.image,
              googleId: account.accountId,
            });

            user.id = newUserId.toString();
          } else {
            user.id = existingAccount._id.toString();
          }

          return true;
        } catch (error) {
          console.error("Error saving Google auth data:", error);
          return true; // Allow sign-in even if DB save fails
        }
      }

      return true;
    },
  },

  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
      },
    },
  },

  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : "https://congenial-goggles-r5qxjv6g59pcx9v6-3000.app.github.dev/",
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.NEXTAUTH_URL || "",
    process.env.NEXT_PUBLIC_BASE_URL || "",
    // Add your production domain
    "https://congenial-goggles-r5qxjv6g59pcx9v6-3000.app.github.dev/",
  ].filter(Boolean),

  secret: process.env.NEXTAUTH_SECRET!,
});
