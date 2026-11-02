import { contrastText } from "./logic/colors";
export { luminance, contrastText } from "./logic/colors";
import { useSyncExternalStore } from "react";
import { useColorScheme } from "react-native";

// Soft neutral surfaces, near-black dark default, one restrained accent.
// Host accent preference overrides the quiet palette accent when set.
export const THEMES = {
  deepseek: {
    name: "DeepSeek",
    light: [
      "#f7f7f5",
      "#efefed",
      "#e6e6e3",
      "#ffffff",
      "#121212",
      "#1a1a1a",
      "#f7f7f5",
      "#2a2a2a",
    ],
    dark: [
      "#050505",
      "#0c0c0c",
      "#1c1c1c",
      "#121212",
      "#f2f2f0",
      "#f2f2f0",
      "#050505",
      "#e8e8e6",
    ],
  },
  mono: {
    name: "Mono",
    light: [
      "#fafafa",
      "#f2f2f2",
      "#e8e8e8",
      "#ffffff",
      "#0d0d0d",
      "#0d0d0d",
      "#fafafa",
      "#0d0d0d",
    ],
    dark: [
      "#000000",
      "#0a0a0a",
      "#1a1a1a",
      "#111111",
      "#f4f4f4",
      "#f4f4f4",
      "#000000",
      "#f4f4f4",
    ],
  },
  paper: {
    name: "Paper",
    light: [
      "#f6f5f2",
      "#eeede8",
      "#e5e3dc",
      "#ffffff",
      "#1c1b18",
      "#2a2925",
      "#f6f5f2",
      "#3a3934",
    ],
    dark: [
      "#0a0a08",
      "#121210",
      "#22221e",
      "#161614",
      "#f0efe9",
      "#f0efe9",
      "#0a0a08",
      "#e6e4dc",
    ],
  },
  moonlight: {
    name: "Moonlight",
    light: [
      "#f5f6f8",
      "#eceef2",
      "#e2e5eb",
      "#ffffff",
      "#12151c",
      "#1a2030",
      "#f5f6f8",
      "#2c3548",
    ],
    dark: [
      "#06070a",
      "#0d0f14",
      "#1a1e28",
      "#12151c",
      "#e8ebf2",
      "#e8ebf2",
      "#06070a",
      "#c9d0de",
    ],
  },
};

export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const TYPE = {
  caption: { fontSize: 12, lineHeight: 17, fontWeight: "400" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodyLarge: { fontSize: 17, lineHeight: 26, fontWeight: "400" as const },
  title: { fontSize: 20, lineHeight: 26, fontWeight: "600" as const },
  display: { fontSize: 28, lineHeight: 34, fontWeight: "600" as const },
} as const;

let preferences: Record<string, unknown> = {};
const listeners = new Set<() => void>();
const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};
export function setThemePreferences(value: Record<string, unknown> = {}) {
  if (
    ["theme", "accent", "motion"].every(
      (key) => value[key] === preferences[key],
    )
  )
    return;
  preferences = value;
  listeners.forEach((callback) => callback());
}
function alpha(hex: string, opacity: number) {
  return `rgba(${[1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)).join(",")},${opacity})`;
}
export function useTheme() {
  const dark = useColorScheme() === "dark";
  const prefs = useSyncExternalStore(
    subscribe,
    () => preferences,
    () => preferences,
  );
  const key =
    typeof prefs.theme === "string" && Object.hasOwn(THEMES, prefs.theme)
      ? (prefs.theme as keyof typeof THEMES)
      : "deepseek";
  const [bg, sidebar, bubble, surface, ink, user, userText, baseAccent] =
    THEMES[key][dark ? "dark" : "light"];
  const accent =
    typeof prefs.accent === "string" && /^#[0-9a-f]{6}$/i.test(prefs.accent)
      ? prefs.accent
      : baseAccent;
  return {
    dark,
    bg,
    sidebar,
    bubble,
    // User chat pills: soft elevated grey, not a saturated tint.
    messageBubble: dark ? "#262626" : "#e8e8e6",
    messageText: dark ? "#f5f5f3" : "#121212",
    surface,
    ink,
    user,
    userText,
    accent,
    link: dark ? "#a8b4cc" : "#3a4a66",
    accentText: contrastText(accent),
    muted: alpha(ink, 0.58),
    faint: alpha(ink, 0.34),
    line: alpha(ink, 0.08),
    lineStrong: alpha(ink, 0.14),
    hover: dark ? "rgba(160,160,160,.10)" : "rgba(80,80,80,.07)",
    active: dark ? "rgba(160,160,160,.18)" : "rgba(80,80,80,.14)",
    soft: alpha(accent, 0.12),
    tagBg: alpha(ink, dark ? 0.09 : 0.06),
    tagInk: alpha(ink, 0.55),
    error: dark ? "#ff7a82" : "#c93942",
    motion: typeof prefs.motion === "string" ? prefs.motion : "normal",
    space: SPACE,
    type: TYPE,
  };
}
export type Theme = ReturnType<typeof useTheme>;
