import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";
import {
  verifyPassword,
  setSessionCookie,
  ensureDefaultAdmin,
  findAdminByUsername,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await initDatabase();
    await ensureDefaultAdmin();

    const body = await request.json();
    const username =
      typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const admin = await findAdminByUsername(username);
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    await setSessionCookie({ id: admin.id, username: admin.username });

    return NextResponse.json({ success: true, username: admin.username });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
