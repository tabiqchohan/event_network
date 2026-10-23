import { db, initDatabase } from "@/lib/db";
import { mikroTikHealthy } from "@/lib/mikrotik";
import { Users, UserCheck, Wifi, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await initDatabase();
  const sql = db();

  const total = await sql`SELECT COUNT(*)::int AS count FROM attendees`;
  const active = await sql`
    SELECT COUNT(*)::int AS count FROM attendees
    WHERE is_active = TRUE AND session_end > CURRENT_TIMESTAMP
  `;
  const today = await sql`
    SELECT COUNT(*)::int AS count FROM attendees
    WHERE created_at >= CURRENT_DATE
  `;
  const wifi = await sql`SELECT ssid FROM wifi_config WHERE id = 1`;
  const event = await sql`
    SELECT event_name, end_time FROM event_config WHERE id = 1
  `;

  let mikrotikOnline = false;
  try {
    mikrotikOnline = await mikroTikHealthy();
  } catch {
    // offline
  }

  const stats = [
    {
      label: "Total Attendees",
      value: total[0].count,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Active Sessions",
      value: active[0].count,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Registered Today",
      value: today[0].count,
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Router Status",
      value: mikrotikOnline ? "Online" : "Offline",
      icon: Wifi,
      color: mikrotikOnline ? "text-green-600" : "text-red-600",
      bg: mikrotikOnline ? "bg-green-100" : "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {event[0]?.event_name || "Event"} — ends{" "}
          {event[0]?.end_time
            ? new Date(event[0].end_time as string).toLocaleString()
            : "N/A"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Network Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Wi-Fi SSID</span>
            <span className="font-medium text-gray-900">
              {wifi[0]?.ssid || "N/A"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Access Type</span>
            <span className="font-medium text-gray-900">
              Open + Captive Portal
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Event Ends</span>
            <span className="font-medium text-gray-900">
              {event[0]?.end_time
                ? new Date(event[0].end_time as string).toLocaleString()
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
