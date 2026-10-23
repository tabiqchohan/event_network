# Event Wi-Fi Captive Portal - Registration & Lead Collection

Production-ready, full-stack Next.js Captive Portal app for event Wi-Fi registration using Neon Serverless Postgres + MikroTik Router.

## User Choices (Final)
- Router: MikroTik hEX S (buy recommended)
- Event Type: Single specific event
- Internet Policy: Till event end (auto expiry)
- WiFi Type: Open WiFi + Captive Portal
- Admin Dashboard: Full featured (leads, live users, revoke, reports)
- OTP: Skip (direct form submit)
- SMS: None (success screen only)
- Form Fields: Name + Mobile only
- Admin Login: Username + Password
- Theme: Light Theme
- Success Screen: Simple "Connected! Enjoy WiFi 🎉"

## Tech Stack
- Framework: Next.js 14+ (App Router, TypeScript)
- Database: Neon Serverless Postgres (`@neondatabase/serverless`)
- Styling: Tailwind CSS (Light Theme: bg-gray-50, cards bg-white)
- Router Integration: MikroTik API (`node-routeros`)
- Admin Auth: bcrypt + JWT cookie session
- Icons: lucide-react

## Database Schema

```sql
-- 1. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wi-Fi Config (Single Row)
CREATE TABLE IF NOT EXISTS wifi_config (
  id INT PRIMARY KEY DEFAULT 1,
  ssid VARCHAR(100) NOT NULL DEFAULT 'Event_WiFi',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO wifi_config (id, ssid) VALUES (1, 'Event_WiFi') ON CONFLICT (id) DO NOTHING;

-- 3. Event Config (Single Row)
CREATE TABLE IF NOT EXISTS event_config (
  id INT PRIMARY KEY DEFAULT 1,
  event_name VARCHAR(200) DEFAULT 'My Event',
  end_time TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Attendees / Leads
CREATE TABLE IF NOT EXISTS attendees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  mac_address VARCHAR(17),
  session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_end TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## App Pages
- `/` - Captive Portal registration form (Name + Mobile)
- `/success` - Success screen after form submit
- `/admin/login` - Admin login
- `/admin` - Dashboard stats overview
- `/admin/attendees` - Leads list (search + export)
- `/admin/sessions` - Live connected users
- `/admin/settings` - WiFi SSID + event end time settings

## API Routes
- `POST /api/register` - Save attendee + MikroTik grant internet
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/logout` - Clear session
- `GET /api/admin/attendees` - List all leads
- `GET /api/admin/sessions` - Live active sessions
- `POST /api/admin/revoke` - Revoke internet access
- `GET/PUT /api/admin/settings` - Get/update WiFi config + event time

## Flow
1. User connects to open WiFi (Event_WiFi)
2. MikroTik captive portal redirects to registration page
3. User fills Name + Mobile
4. Backend saves lead (with MAC from MikroTik)
5. Backend calls MikroTik API to grant internet access
6. Session set till event end time
7. Success screen: "Connected! Enjoy WiFi 🎉"
8. Full internet access

## MikroTik Setup Guide
1. Setup MikroTik hEX S via WinBox
2. Create Hotspot server with open WiFi (no password)
3. Set captive portal redirect to app URL
4. Create API user with read/write permissions
5. Configure DHCP + NAT + firewall rules

## Environment Variables (.env.local)
```
DATABASE_URL=postgresql://...
MIKROTIK_HOST=192.168.88.1
MIKROTIK_USERNAME=admin
MIKROTIK_PASSWORD=xxxxx
MIKROTIK_HOTSPOT_SERVER=hotspot1
JWT_SECRET=random-secret-key
ADMIN_DEFAULT_USERNAME=admin
ADMIN_DEFAULT_PASSWORD=changeme123
```
