import { NextResponse } from "next/server";
import { db, initDatabase } from "@/lib/db";
import { mikroTikHealthy, addHotspotUser } from "@/lib/mikrotik";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await initDatabase();
    const sql = db();

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Please enter a valid name (min 2 characters)." },
        { status: 400 }
      );
    }

    if (!/^[0-9+\-\s]{7,20}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid mobile number." },
        { status: 400 }
      );
    }

    const eventRows = await sql`SELECT end_time FROM event_config WHERE id = 1`;
    const eventEnd = eventRows[0]?.end_time
      ? new Date(eventRows[0].end_time as string)
      : new Date(Date.now() + 8 * 60 * 60 * 1000);

    const existing = await sql`
      SELECT id FROM attendees WHERE phone = ${phone}
    `;

    let attendeeId: number;

    if (existing.length > 0) {
      const updated = await sql`
        UPDATE attendees
        SET name = ${name},
            is_active = TRUE,
            session_start = CURRENT_TIMESTAMP,
            session_end = ${eventEnd.toISOString()}
        WHERE phone = ${phone}
        RETURNING id
      `;
      attendeeId = updated[0].id as number;
    } else {
      const inserted = await sql`
        INSERT INTO attendees (name, phone, session_end)
        VALUES (${name}, ${phone}, ${eventEnd.toISOString()})
        RETURNING id
      `;
      attendeeId = inserted[0].id as number;
    }

    let mikrotikGranted = false;
    try {
      const healthy = await mikroTikHealthy();
      if (healthy) {
        await addHotspotUser(`attendee-${attendeeId}`, "00:00:00:00:00:00");
        mikrotikGranted = true;
      }
    } catch {
      // MikroTik not reachable - lead is still saved
    }

    return NextResponse.json({
      success: true,
      attendeeId,
      mikrotikGranted,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
