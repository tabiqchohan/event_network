"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Wifi, WifiOff, Ban, Radio } from "lucide-react";
import type { Attendee } from "@/lib/db";

type MikroTikActive = Record<string, string>;

export default function SessionsClient() {
  const [dbActive, setDbActive] = useState<Attendee[]>([]);
  const [mikrotikActive, setMikrotikActive] = useState<MikroTikActive[]>([]);
  const [mikrotikOnline, setMikrotikOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      const data = await res.json();
      if (res.ok) {
        setDbActive(data.dbActive);
        setMikrotikActive(data.mikrotikActive);
        setMikrotikOnline(data.mikrotikOnline);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        const res = await fetch("/api/admin/sessions");
        const data = await res.json();
        if (!cancelled && res.ok) {
          setDbActive(data.dbActive);
          setMikrotikActive(data.mikrotikActive);
          setMikrotikOnline(data.mikrotikOnline);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initialLoad();
    const interval = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [load]);

  async function revoke(attendeeId: number) {
    if (!confirm("Revoke internet access for this attendee?")) return;
    setRevoking(attendeeId);
    try {
      await fetch("/api/admin/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId }),
      });
      await load();
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Sessions</h1>
          <p className="text-gray-600 mt-1">
            Currently active internet sessions
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 p-4">
        {mikrotikOnline ? (
          <Wifi className="w-5 h-5 text-green-600" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-600" />
        )}
        <div>
          <p className="font-medium text-gray-900">
            MikroTik Router:{" "}
            {mikrotikOnline ? "Online" : "Offline / Not configured"}
          </p>
          <p className="text-sm text-gray-600">
            {mikrotikActive.length} active hotspot sessions on router
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <Radio className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">
            Active Attendees ({dbActive.length})
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Phone
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Session Started
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Expires
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {dbActive.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No active sessions
                  </td>
                </tr>
              ) : (
                dbActive.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {a.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{a.phone}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.session_start
                        ? new Date(a.session_start).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.session_end
                        ? new Date(a.session_end).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => revoke(a.id)}
                        disabled={revoking === a.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mikrotikActive.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <span className="font-medium text-gray-900">
              MikroTik Hotspot Active ({mikrotikActive.length})
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    User
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    MAC Address
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    IP Address
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Uptime
                  </th>
                </tr>
              </thead>
              <tbody>
                {mikrotikActive.map((s, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {s.user || s.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                      {s["mac-address"] || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                      {s.address || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {s.uptime || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
