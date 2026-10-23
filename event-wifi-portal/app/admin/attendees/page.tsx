import { db, initDatabase, type Attendee } from "@/lib/db";
import AttendeesClient from "@/components/AttendeesClient";

export const dynamic = "force-dynamic";

export default async function AttendeesPage() {
  await initDatabase();
  const sql = db();

  const rows = await sql`
    SELECT * FROM attendees ORDER BY created_at DESC LIMIT 500
  `;
  const total = await sql`SELECT COUNT(*)::int AS count FROM attendees`;
  const active = await sql`
    SELECT COUNT(*)::int AS count FROM attendees WHERE is_active = TRUE
  `;

  return (
    <AttendeesClient
      initialAttendees={rows as Attendee[]}
      total={total[0].count}
      active={active[0].count}
    />
  );
}
