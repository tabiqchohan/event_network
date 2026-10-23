import { NextResponse } from "next/server";
import { db, initDatabase, type Attendee } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getHotspotActive, mikroTikHealthy } from "@/lib/mikrotik";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();
    const sql = db();

    const dbActive = await sql`
      SELECT * FROM attendees
      WHERE is_active = TRUE AND session_end > CURRENT_TIMESTAMP
      ORDER BY session_start DESC
    `;

    let mikrotikActive: Array<Record<string, string>> = [];
    let mikrotikOnline = false;
    try {
      mikrotikOnline = await mikroTikHealthy();
      if (mikrotikOnline) {
        mikrotikActive = await getHotspotActive();
      }
    } catch {
      // MikroTik offline
    }

    return NextResponse.json({
      dbActive: dbActive as Attendee[],
      mikrotikActive,
      mikrotikOnline,
    });
  } catch (err) {
    console.error("Sessions error:", err);
    return NextResponse.json(
      { error: "Failed to load sessions." },
      { status: 500 }
    );
  }
}
