import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import { History } from "@/app/model"
import mongoose from "mongoose"

export async function GET(req: Request) {
  try {
    // Get session using better-auth's API
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await connectDb()

    const history = await History.find({
      userId: new mongoose.Types.ObjectId(session.user.id)
    }).sort({ watchedAt: -1 })

    return NextResponse.json(history)
  } catch (err) {
    console.error("GET history error:", err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Get session using better-auth's API
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { mediaId, mediaType, title, backdrop_path, season, episode } = await req.json()

    if (!mediaId || !mediaType || !title) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    await connectDb()

    const history = await History.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      mediaId,
      mediaType,
      title,
      backdrop_path,
      season,
      episode,
      watchedAt: new Date()
    })

    return NextResponse.json(history)
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: err.message },
        { status: 400 }
      )
    }

    console.error("POST history error:", err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    // Get session using better-auth's API
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { mediaId, mediaType, season, episode } = await req.json()

    if (!mediaId || !mediaType) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    await connectDb()

    await History.deleteMany({
      userId: new mongoose.Types.ObjectId(session.user.id),
      mediaId,
      mediaType,
      ...(season && { season }),
      ...(episode && { episode })
    })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error("DELETE history error:", err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
