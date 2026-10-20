import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/auth/redirect";
  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
