import { NextResponse } from "next/server";
import { incrementPlayCount } from "@/lib/services/game";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  await incrementPlayCount(slug);
  return NextResponse.json({ ok: true });
}
