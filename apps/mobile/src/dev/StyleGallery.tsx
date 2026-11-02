import React, { useMemo, useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FadeIn, MotionProvider, PulsingDots, Shimmer, SpringIn } from "../components/Motion";
import { Button, Icon } from "../components/UI";
import { SPACE, THEMES, TYPE, setThemePreferences, useTheme } from "../theme";
import { BotAvatar, mainLook } from "../components/BotAvatar";
import { contrastText } from "../logic/colors";

function alpha(hex: string, opacity: number) {
  return `rgba(${[1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)).join(",")},${opacity})`;
}

function palette(scheme: "light" | "dark") {
  const dark = scheme === "dark";
  const [bg, sidebar, bubble, surface, ink, user, userText, accent] = THEMES.deepseek[scheme];
  return {
    dark,
    bg,
    sidebar,
    bubble,
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
    motion: "normal",
    space: SPACE,
    type: TYPE,
  };
}

/**
 * Web/dev-only visual gallery for style screenshots. No bridge or pairing logic.
 * Open with ?gallery=1 on Expo web. Use ?scheme=light|dark to force a palette.
 */
export function StyleGallery() {
  const initial = (() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const value = new URLSearchParams(window.location.search).get("scheme");
      if (value === "light" || value === "dark") return value;
    }
    return "dark" as const;
  })();
  const [scheme, setScheme] = useState<"light" | "dark">(initial);
  React.useEffect(() => {
    setThemePreferences({ theme: "deepseek" });
  }, []);
  const colors = useMemo(() => palette(scheme), [scheme]);
  return (
    <MotionProvider>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ position: "absolute", top: 8, right: 8, zIndex: 5, flexDirection: "row", gap: 8 }}>
          <Button compact title="Dark" secondary={scheme !== "dark"} onPress={() => setScheme("dark")} />
          <Button compact title="Light" secondary={scheme !== "light"} onPress={() => setScheme("light")} />
        </View>
        <GalleryBody key={scheme} scheme={scheme} colors={colors} />
      </View>
    </MotionProvider>
  );
}

function GalleryBody({
  scheme,
  colors: t,
}: {
  scheme: "light" | "dark";
  colors: ReturnType<typeof palette>;
}) {
  // Keep shared UI primitives on the live theme hook while local screens use forced colors.
  useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 28, maxWidth: 420, width: "100%", alignSelf: "center", paddingBottom: 48 }}>
        <View style={{ flexDirection: "row", gap: 8 }} nativeID="scheme-controls">
          <Text style={{ color: t.muted, alignSelf: "center", fontSize: 12 }}>{scheme}</Text>
        </View>

        <FadeIn>
          <View nativeID="screen-pairing" testID="screen-pairing" style={{ gap: 14, padding: 20, borderRadius: 18, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg }}>
            <View style={{ alignItems: "center", gap: 10 }}>
              <BotAvatar bot={mainLook} size={64} />
              <Text style={{ color: t.ink, fontSize: 26, fontWeight: "600" }}>DS Bot</Text>
              <Text style={{ color: t.muted, fontSize: 14 }}>Connect to your Bot team.</Text>
            </View>
            <View style={{ gap: 7 }}>
              <Text style={{ color: t.ink, fontSize: 13, fontWeight: "500" }}>Pairing JSON</Text>
              <Text style={{ backgroundColor: t.surface, color: t.ink, borderWidth: 1, borderColor: t.line, borderRadius: 14, padding: 12, fontSize: 15, minHeight: 72 }}>
                {"{\"url\":\"https://example.trycloudflare.com\",\"code\":\"••••\",\"serverId\":\"srv_demo\"}"}
              </Text>
            </View>
            <View style={{ gap: 7 }}>
              <Text style={{ color: t.ink, fontSize: 13, fontWeight: "500" }}>Device name</Text>
              <Text style={{ backgroundColor: t.surface, color: t.ink, borderWidth: 1, borderColor: t.line, borderRadius: 14, padding: 12, fontSize: 15, minHeight: 44 }}>My Android</Text>
            </View>
            <View style={{ minHeight: 44, borderRadius: 999, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: t.accentText, fontWeight: "500" }}>Pair device</Text>
            </View>
            <View style={{ borderRadius: 999, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 20, paddingVertical: 12 }}>
              <Text style={{ color: t.muted, fontSize: 13 }}>Waiting for approval on your computer…</Text>
            </View>
          </View>
        </FadeIn>

        <SpringIn>
          <View nativeID="screen-list" testID="screen-list" style={{ gap: 8, padding: 12, borderRadius: 18, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, minHeight: 360 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" }}>
                <Icon name="settings" color={t.ink} />
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" }}>
                  <Icon name="search" color={t.ink} />
                </View>
                <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" }}>
                  <Icon name="plus" color={t.ink} />
                </View>
              </View>
            </View>
            <View style={{ alignItems: "center", gap: 8, paddingVertical: 12 }}>
              <BotAvatar bot={mainLook} size={72} />
              <Text style={{ color: t.muted, fontSize: 14 }}>Chief</Text>
            </View>
            {[
              { name: "Chief", preview: "Draft the release notes", time: "9:41" },
              { name: "Research", preview: "Found three sources", time: "Yesterday" },
              { name: "Ops room", preview: "Waiting for approval", time: "Mon" },
            ].map((row, index) => (
              <View key={row.name} style={{ flexDirection: "row", gap: 14, alignItems: "center", paddingHorizontal: 10, paddingVertical: 14, borderRadius: 16, backgroundColor: index === 0 ? t.hover : undefined }}>
                <BotAvatar bot={{ ...mainLook, id: row.name, name: row.name }} size={42} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ color: t.ink, fontWeight: "600", fontSize: 16 }}>{row.name}</Text>
                  <Text numberOfLines={1} style={{ color: t.muted, fontSize: 14 }}>{row.preview}</Text>
                </View>
                <Text style={{ color: t.faint, fontSize: 12 }}>{row.time}</Text>
              </View>
            ))}
          </View>
        </SpringIn>

        <FadeIn delay={80}>
          <View nativeID="screen-chat" testID="screen-chat" style={{ gap: 12, padding: 12, borderRadius: 18, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, minHeight: 520 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" }}>
                <Icon name="back" color={t.ink} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 28, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
                <BotAvatar bot={mainLook} size={28} />
                <Text style={{ color: t.ink, fontWeight: "600", fontSize: 16 }}>Chief</Text>
              </View>
            </View>

            <View style={{ alignSelf: "flex-end", maxWidth: "86%", backgroundColor: t.messageBubble, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10 }}>
              <Text style={{ color: t.messageText, fontSize: 16, lineHeight: 22 }}>Summarize the bridge status and list open tools.</Text>
            </View>

            <View style={{ paddingHorizontal: 2, gap: 10 }}>
              <Text style={{ color: t.ink, fontSize: 17, lineHeight: 26 }}>
                The mobile bridge is healthy. Pairing stays on protocolVersion 1, HTTPS public URLs work, and tool cards stay compact.
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: 40, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
                <Icon name="check" size={14} color={t.muted} />
                <Text style={{ color: t.ink, fontSize: 13, flex: 1 }}>web_search</Text>
                <Text style={{ color: t.muted, fontSize: 11 }}>Completed</Text>
                <Icon name="chevron" size={14} color={t.muted} />
              </View>
              <View style={{ backgroundColor: t.surface, borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: t.line }}>
                <Text style={{ color: t.muted, fontSize: 14 }}>Tool result</Text>
                <Text style={{ color: t.ink, fontSize: 13, lineHeight: 19 }}>3 pages indexed · 0 errors</Text>
              </View>
              <PulsingDots color={t.muted} />
            </View>

            <View style={{ marginTop: "auto", flexDirection: "row", alignItems: "flex-end", minHeight: 52, borderRadius: 28, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 4, gap: 2 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }}>
                <Icon name="plus" color={t.ink} />
              </View>
              <Text style={{ flex: 1, color: t.muted, paddingHorizontal: 8, paddingVertical: 12, fontSize: 16 }}>Ask Chief</Text>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.accent, alignItems: "center", justifyContent: "center" }}>
                <Icon name="send" size={18} color={t.accentText} />
              </View>
            </View>
          </View>
        </FadeIn>

        <View style={{ gap: 10 }}>
          <Text style={{ color: t.muted, fontSize: 14 }}>Loading placeholders</Text>
          <Shimmer height={16} width="70%" />
          <Shimmer height={56} radius={16} />
        </View>

        {Platform.OS === "web" ? <Text style={{ color: t.faint, fontSize: 11 }}>Style gallery · {scheme} · UI-only preview</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
