"use server";

import { auth } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "@/app/model";

export const signIn = async (email: string, password: string) => {
    try {
        await auth.api.signInEmail({
            body: {
                email,
                password,
            }
        })

        return {
            success: true,
            message: "Signed in successfully."
        }
    } catch (error) {
        const e = error as Error

        return {
            success: false,
            message: e.message || "An unknown error occurred."
        }
    }
}

export const signUp = async (email: string, password: string, username: string) => {
    try {
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: username,
                username
            }
        })

        return {
            success: true,
            message: "Signed up successfully."
        }
    } catch (error) {
        const e = error as Error

        return {
            success: false,
            message: e.message || "An unknown error occurred."
        }
    }
}

export const getCurrentUser = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/");
    }

    const currentUser = await User.findById(session.user.id);

    if (!currentUser) {
        redirect("/");
    }

    return {
        ...session,
        currentUser
    }
}