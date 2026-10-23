import { NextResponse } from "next/server";
import { db, initDatabase } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { removeHotspotActive } from "@/lib/mikrotik";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();
    const sql = db();

    const body = await request.json();
    const attendeeId =
      typeof body.attendeeId === "number" ? body.attendeeId : null;
    const mikrotikId =
      typeof body.mikrotikId === "string" ? body.mikrotikId : null;

    if (!attendeeId && !mikrotikId) {
      return NextResponse.json(
        { error: "attendeeId or mikrotikId required." },
        { status: 400 }
      );
    }

    if (attendeeId) {
      await sql`
        UPDATE attendees
        SET is_active = FALSE
        WHERE id = ${attendeeId}
      `;
    }

    if (mikrotikId) {
      try {
        await removeHotspotActive(mikrotikId);
      } catch {
        // MikroTik may be offline
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Revoke error:", err);
    return NextResponse.json(
      { error: "Failed to revoke access." },
      { status: 500 }
    );
  }
}
