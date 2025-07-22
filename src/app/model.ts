import mongoose, { Schema, model, models } from "mongoose";

// User Schema
const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true }, // Ensure username is required and unique
    email: { type: String, required: true, unique: true }, // Ensure email is required and unique
    password: { type: String, required: true }, // Ensure password is required
    emailVerified: { type: Date, required: false },
    image: { type: String, required: false }, // Add image field for profile picture
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const User = models.User || model("User", UserSchema);

const AccountSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: false },
    email: { type: String, required: false },
    image: { type: String, required: false },
    googleId: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export const Account = models.Account || model("Account", AccountSchema);

// Session Schema
const SessionSchema = new Schema(
  {
    sessionToken: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expires: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Session = models.Session || model("Session", SessionSchema);

// Watchlist Schema
const WatchlistSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaId: { type: String, required: true },
    mediaType: { type: String, required: true }, // "movie" or "tv"
    title: { type: String, required: true },
    backdrop_path: { type: String, required: false },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

WatchlistSchema.index(
  { userId: 1, mediaId: 1, mediaType: 1 },
  { unique: true },
);

export const Watchlist =
  models.Watchlist || model("Watchlist", WatchlistSchema);

// History Schema
const HistorySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaId: { type: String, required: true },
    mediaType: { type: String, required: true }, // "movie" or "tv"
    title: { type: String, required: true },
    backdrop_path: { type: String, required: false },
    season: { type: Number, required: false }, // For TV shows
    episode: { type: Number, required: false }, // For TV shows
    watchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

HistorySchema.index(
  { userId: 1, mediaId: 1, mediaType: 1, season: 1, episode: 1 },
  { unique: true },
);

export const History = models.History || model("History", HistorySchema);
