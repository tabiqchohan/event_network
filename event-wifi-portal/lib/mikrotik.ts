import { RouterOSAPI } from "node-routeros";

type MikroTikConfig = {
  host: string;
  username: string;
  password: string;
  port?: number;
};

function getConfig(): MikroTikConfig {
  return {
    host: process.env.MIKROTIK_HOST || "192.168.88.1",
    username: process.env.MIKROTIK_USERNAME || "admin",
    password: process.env.MIKROTIK_PASSWORD || "",
    port: parseInt(process.env.MIKROTIK_PORT || "8728", 10),
  };
}

export async function withMikroTik<T>(
  fn: (conn: RouterOSAPI) => Promise<T>
): Promise<T> {
  const config = getConfig();
  const conn = new RouterOSAPI({
    host: config.host,
    user: config.username,
    password: config.password,
    port: config.port,
  });

  try {
    await conn.connect();
    return await fn(conn);
  } finally {
    try {
      conn.close();
    } catch {
      // ignore close errors
    }
  }
}

export async function getHotspotActive(): Promise<
  Array<Record<string, string>>
> {
  return withMikroTik(async (conn) => {
    const data = await conn.write("/ip/hotspot/active/print");
    return data as Array<Record<string, string>>;
  });
}

export async function removeHotspotActive(id: string): Promise<void> {
  await withMikroTik(async (conn) => {
    await conn.write("/ip/hotspot/active/remove", [`=.id=${id}`]);
  });
}

export async function addHotspotUser(
  name: string,
  macAddress: string,
  limitUptime?: string
): Promise<string | null> {
  return withMikroTik(async (conn) => {
    const params = [
      "=server=all",
      `=name=${name}`,
      `=mac-address=${macAddress}`,
      "=profile=default",
      "=comment=event-wifi-portal",
    ];
    if (limitUptime) {
      params.push(`=limit-uptime=${limitUptime}`);
    }
    const data = await conn.write("/ip/hotspot/user/add", params);
    return (data[0]?.ret as string) ?? null;
  });
}

export async function removeHotspotUserByName(name: string): Promise<void> {
  await withMikroTik(async (conn) => {
    const users = await conn.write("/ip/hotspot/user/print", [
      `=name=${name}`,
    ]);
    for (const user of users as Array<Record<string, string>>) {
      if (user[".id"]) {
        await conn.write("/ip/hotspot/user/remove", [`=.id=${user[".id"]}`]);
      }
    }
  });
}

export async function mikroTikHealthy(): Promise<boolean> {
  try {
    await withMikroTik(async (conn) => {
      await conn.write("/system/identity/print");
    });
    return true;
  } catch {
    return false;
  }
}
