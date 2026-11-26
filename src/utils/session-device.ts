export type SessionDevice = {
  name: string;
  browser: string | null;
  kind: "desktop" | "mobile" | "tablet" | "unknown";
};

// User-Agent is client-reported. Do not use it for authorization or identity.
export function sessionDevice(userAgent?: string | null): SessionDevice {
  if (!userAgent)
    return { name: "Unknown device", browser: null, kind: "unknown" };
  const ua = userAgent.toLowerCase();
  let name = "Unknown device";
  let kind: SessionDevice["kind"] = "unknown";

  if (ua.includes("ipad")) {
    name = "iPad";
    kind = "tablet";
  } else if (ua.includes("iphone") || ua.includes("ipod")) {
    name = "iPhone · iOS";
    kind = "mobile";
  } else if (ua.includes("android")) {
    name = "Android";
    kind = ua.includes("mobile") ? "mobile" : "tablet";
  } else if (ua.includes("windows")) {
    name = "Windows";
    kind = "desktop";
  } else if (ua.includes("macintosh") || ua.includes("mac os x")) {
    name = "Mac · macOS";
    kind = "desktop";
  } else if (ua.includes("cros")) {
    name = "ChromeOS";
    kind = "desktop";
  } else if (ua.includes("linux")) {
    name = "Linux";
    kind = "desktop";
  }

  let browser: string | null = null;
  if (/edg(?:e|a|ios)?\//.test(ua)) browser = "Microsoft Edge";
  else if (/opr\/|opera/.test(ua)) browser = "Opera";
  else if (ua.includes("samsungbrowser/")) browser = "Samsung Internet";
  else if (/firefox\/|fxios\//.test(ua)) browser = "Firefox";
  else if (/chrome\/|crios\//.test(ua)) browser = "Chrome";
  else if (ua.includes("safari/")) browser = "Safari";

  return { name, browser, kind };
}
