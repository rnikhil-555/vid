import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { User } from "@/app/model";

async function verifyCaptcha(token: string) {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: process.env.CLOUDFLARE_SECRET_KEY,
      response: token,
    }),
  });

  const data = await res.json();
  return data.success;
}

export async function POST(req: Request) {
  try {
    const { email, password, username, cfToken } = await req.json();

    // Verify captcha first
    if (!cfToken) {
      return new Response(
        JSON.stringify({ message: "Captcha verification required" }),
        { status: 400 }
      );
    }

    const isValidCaptcha = await verifyCaptcha(cfToken);
    if (!isValidCaptcha) {
      return new Response(
        JSON.stringify({ message: "Invalid captcha" }),
        { status: 400 }
      );
    }

    if (!email || !password || !username) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDb();

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "Email already registered" }),
        { status: 409 } // Use 409 Conflict for duplicate resource
      );
    }

    // Check if the username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the user
    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      emailVerified: null,
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        message: error instanceof Error ? error.message : "An error occurred during signup" 
      }),
      { status: 500 }
    );
  }
}