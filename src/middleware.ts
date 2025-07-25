import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = [
	"/watchlist",
	"/history",
	"/profile"
];
export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

	if (!sessionCookie && isProtectedRoute) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/"],
};