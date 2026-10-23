import { db, initDatabase, type WifiConfig, type EventConfig } from "@/lib/db";
import SettingsClient from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await initDatabase();
  const sql = db();

  const wifi = await sql`SELECT * FROM wifi_config WHERE id = 1`;
  const event = await sql`SELECT * FROM event_config WHERE id = 1`;

  return (
    <SettingsClient
      initialWifi={wifi[0] as WifiConfig}
      initialEvent={event[0] as EventConfig}
    />
  );
}
