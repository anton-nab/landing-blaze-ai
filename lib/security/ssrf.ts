import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// The audit route fetches arbitrary user-supplied URLs server-side — without
// this guard a hostile URL could target internal infra (localhost, RFC1918
// ranges, or cloud metadata endpoints like 169.254.169.254) via a plain IP
// literal or DNS rebinding. Every hop (including redirect targets) must pass.

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

const PRIVATE_V4_RANGES: [string, string][] = [
  ["0.0.0.0", "0.255.255.255"],
  ["10.0.0.0", "10.255.255.255"],
  ["100.64.0.0", "100.127.255.255"], // CGNAT
  ["127.0.0.0", "127.255.255.255"], // loopback
  ["169.254.0.0", "169.254.255.255"], // link-local — cloud metadata lives here
  ["172.16.0.0", "172.31.255.255"],
  ["192.0.0.0", "192.0.0.255"],
  ["192.168.0.0", "192.168.255.255"],
  ["198.18.0.0", "198.19.255.255"],
  ["224.0.0.0", "255.255.255.255"], // multicast/reserved
].map(([lo, hi]) => [lo, hi]);

const PRIVATE_V4_RANGES_INT = PRIVATE_V4_RANGES.map(
  ([lo, hi]) => [ipv4ToInt(lo), ipv4ToInt(hi)] as const,
);

function isPrivateV4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  return PRIVATE_V4_RANGES_INT.some(([lo, hi]) => n >= lo && n <= hi);
}

function isPrivateV6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe80:")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateV4(mapped[1]);
  return false;
}

export class UnsafeUrlError extends Error {}

export async function assertPublicHttpUrl(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Seuls les liens http/https sont autorisés.");
  }
  if (url.hostname === "localhost" || url.hostname.endsWith(".localhost")) {
    throw new UnsafeUrlError("Cette URL n'est pas autorisée.");
  }

  const version = isIP(url.hostname);
  if (version === 4) {
    if (isPrivateV4(url.hostname)) throw new UnsafeUrlError("Cette URL n'est pas autorisée.");
    return;
  }
  if (version === 6) {
    if (isPrivateV6(url.hostname)) throw new UnsafeUrlError("Cette URL n'est pas autorisée.");
    return;
  }

  // Plain hostname — resolve and check every A/AAAA record (blocks DNS rebinding).
  let records;
  try {
    records = await lookup(url.hostname, { all: true });
  } catch {
    throw new UnsafeUrlError("Impossible de résoudre ce nom de domaine.");
  }
  if (records.length === 0) {
    throw new UnsafeUrlError("Impossible de résoudre ce nom de domaine.");
  }
  for (const record of records) {
    if (record.family === 4 && isPrivateV4(record.address)) {
      throw new UnsafeUrlError("Cette URL n'est pas autorisée.");
    }
    if (record.family === 6 && isPrivateV6(record.address)) {
      throw new UnsafeUrlError("Cette URL n'est pas autorisée.");
    }
  }
}
