import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { Watchlist } from "@/app/model";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    // Get session using better-auth's API
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDb();

    const watchlist = await Watchlist.find({
      userId: new mongoose.Types.ObjectId(session.user.id)
    }).sort({ addedAt: -1 });

    return NextResponse.json(watchlist);
  } catch (err) {
    console.error("GET watchlist error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Get session using better-auth's API
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { mediaId, mediaType, title, backdrop_path } = await req.json();

    if (!mediaId || !mediaType || !title) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await connectDb();

    const watchlist = await Watchlist.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      mediaId,
      mediaType,
      title,
      backdrop_path,
      addedAt: new Date()
    });

    return NextResponse.json(watchlist);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: err.message },
        { status: 400 }
      );
    }

    if ((err as any).code === 11000) {
      return NextResponse.json(
        { error: "Item already in watchlist" },
        { status: 409 }
      );
    }

    console.error("POST watchlist error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // Get session using better-auth's API
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { mediaId, mediaType, removeAll } = await req.json();

    await connectDb();

    if (removeAll) {
      await Watchlist.deleteMany({
        userId: new mongoose.Types.ObjectId(session.user.id)
      });
      return new NextResponse(null, { status: 204 });
    }

    if (!mediaId || !mediaType) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await Watchlist.deleteOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
      mediaId,
      mediaType
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE watchlist error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
