import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import type {
  OpaqueColorValue,
  StyleProp,
  TextStyle,
} from "react-native";

const MAPPING = {
  "house.fill": "home",
  "list.bullet": "receipt-long",
  "chart.pie.fill": "pie-chart",
  "gearshape.fill": "settings",
  "plus.circle.fill": "add-circle",
  "wallet.fill": "account-balance-wallet",
  "camera.fill": "photo-camera",
  "bell.fill": "notifications",
  "power.fill": "power-settings-new",
} as const satisfies Record<
  string,
  ComponentProps<typeof MaterialIcons>["name"]
>;

export type IconSymbolName = keyof typeof MAPPING;

interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: IconSymbolProps) {
  return (
    <MaterialIcons
      name={MAPPING[name]}
      size={size}
      color={color}
      style={style}
    />
  );
}
