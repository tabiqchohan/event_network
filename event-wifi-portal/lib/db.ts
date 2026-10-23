import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

export function db(): NeonQueryFunction<false, false> {
  return getSql();
}

export async function initDatabase() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS wifi_config (
      id INT PRIMARY KEY DEFAULT 1,
      ssid VARCHAR(100) NOT NULL DEFAULT 'Event_WiFi',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    INSERT INTO wifi_config (id, ssid) VALUES (1, 'Event_WiFi')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS event_config (
      id INT PRIMARY KEY DEFAULT 1,
      event_name VARCHAR(200) DEFAULT 'My Event',
      end_time TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '8 hours'),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    INSERT INTO event_config (id, event_name, end_time)
    VALUES (1, 'My Event', CURRENT_TIMESTAMP + INTERVAL '8 hours')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS attendees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL UNIQUE,
      mac_address VARCHAR(17),
      session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      session_end TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export type AdminUser = {
  id: number;
  username: string;
  password_hash: string;
};

export type Attendee = {
  id: number;
  name: string;
  phone: string;
  mac_address: string | null;
  session_start: Date | null;
  session_end: Date | null;
  is_active: boolean;
  created_at: Date;
};

export type WifiConfig = {
  id: number;
  ssid: string;
  updated_at: Date;
};

export type EventConfig = {
  id: number;
  event_name: string;
  end_time: Date;
  updated_at: Date;
};
