import { NextResponse } from "next/server";
import {
  db,
  initDatabase,
  type WifiConfig,
  type EventConfig,
} from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();
    const sql = db();

    const wifi = await sql`SELECT * FROM wifi_config WHERE id = 1`;
    const event = await sql`SELECT * FROM event_config WHERE id = 1`;

    return NextResponse.json({
      wifi: wifi[0] as WifiConfig,
      event: event[0] as EventConfig,
    });
  } catch (err) {
    console.error("Settings GET error:", err);
    return NextResponse.json(
      { error: "Failed to load settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();
    const sql = db();

    const body = await request.json();
    const ssid = typeof body.ssid === "string" ? body.ssid.trim() : "";
    const eventName =
      typeof body.eventName === "string" ? body.eventName.trim() : "";
    const endTime = typeof body.endTime === "string" ? body.endTime.trim() : "";

    if (!ssid || !eventName || !endTime) {
      return NextResponse.json(
        { error: "SSID, event name and end time are required." },
        { status: 400 }
      );
    }

    const end = new Date(endTime);
    if (isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid end time format." },
        { status: 400 }
      );
    }

    await sql`
      UPDATE wifi_config
      SET ssid = ${ssid}, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `;

    await sql`
      UPDATE event_config
      SET event_name = ${eventName},
          end_time = ${end.toISOString()},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Settings PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update settings." },
      { status: 500 }
    );
  }
}
