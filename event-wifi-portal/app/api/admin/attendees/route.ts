import { NextResponse } from "next/server";
import { db, initDatabase, type Attendee } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();
    const sql = db();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    let rows;
    if (q) {
      rows = await sql`
        SELECT * FROM attendees
        WHERE name ILIKE ${`%${q}%`} OR phone ILIKE ${`%${q}%`}
        ORDER BY created_at DESC
        LIMIT 500
      `;
    } else {
      rows = await sql`
        SELECT * FROM attendees
        ORDER BY created_at DESC
        LIMIT 500
      `;
    }

    const total = await sql`SELECT COUNT(*)::int AS count FROM attendees`;
    const active = await sql`
      SELECT COUNT(*)::int AS count FROM attendees WHERE is_active = TRUE
    `;

    return NextResponse.json({
      attendees: rows as Attendee[],
      total: total[0].count,
      active: active[0].count,
    });
  } catch (err) {
    console.error("Attendees error:", err);
    return NextResponse.json(
      { error: "Failed to load attendees." },
      { status: 500 }
    );
  }
}
