import { useColorScheme } from "react-native";

export function useColors() {
  const scheme = useColorScheme() ?? "light";

  if (scheme === "dark") {
    return {
      primary: "#0A7EA4",
      background: "#151718",
      surface: "#1E2022",
      foreground: "#ECEDEE",
      muted: "#9BA1A6",
      border: "#334155",
      success: "#4ADE80",
      warning: "#FBBF24",
      error: "#F87171",
    };
  }

  return {
    primary: "#0A7EA4",
    background: "#FFFFFF",
    surface: "#F5F5F5",
    foreground: "#11181C",
    muted: "#687076",
    border: "#E5E7EB",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
  };
}
