import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { connectDb } from "@/lib/mongodb";
import { User } from "@/app/model";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    await connectDb();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = sign(
      {
        id: user._id,
        email: user.email,
        username: user.username
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified
      },
      token
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}