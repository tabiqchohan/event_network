"use client";

import { useState } from "react";
import { Save, Loader2, Wifi, CalendarClock } from "lucide-react";
import type { WifiConfig, EventConfig } from "@/lib/db";

type Props = {
  initialWifi: WifiConfig;
  initialEvent: EventConfig;
};

export default function SettingsClient({ initialWifi, initialEvent }: Props) {
  const [ssid, setSsid] = useState(initialWifi.ssid);
  const [eventName, setEventName] = useState(initialEvent.event_name);
  const [endTime, setEndTime] = useState(() => {
    const d = new Date(initialEvent.end_time);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ssid,
          eventName,
          endTime: new Date(endTime).toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to save.");
        return;
      }

      setMessage("Settings saved successfully!");
    } catch {
      setMessage("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage Wi-Fi SSID and event configuration
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Wi-Fi Configuration</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Network SSID (Wi-Fi Name)
            </label>
            <input
              type="text"
              required
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="Event_WiFi"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              This is the Wi-Fi network name shown to attendees. Configure the
              same SSID in your MikroTik hotspot settings.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Event Configuration</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Event Name
            </label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Tech Conference 2026"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Event End Time (auto-disconnect)
            </label>
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Attendees&apos; internet access will auto-expire at this time.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`text-sm rounded-xl px-4 py-3 ${
              message.includes("success")
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}
