import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  account: {
    accountLinking: {
      trustedProviders: ["google"],
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 1 week
    updateAge: 60 * 60 * 24, // 1 day
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      accessType: "offline",
      prompt: "select_account+consent",
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

  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.BETTER_AUTH_URL || "",
    process.env.NEXT_PUBLIC_BASE_URL || "",
    "https://congenial-goggles-r5qxjv6g59pcx9v6-3000.app.github.dev/",
  ].filter(Boolean),

  secret: process.env.BETTER_AUTH_SECRET!,
});