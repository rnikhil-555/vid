import { createAuthClient } from "better-auth/react";
 
export const authClient = createAuthClient({
    baseURL: process.env.AUTH_URL!
});
 
export const { signIn, signOut, useSession } = authClient;