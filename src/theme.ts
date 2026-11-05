import { Platform, type TextStyle, type ViewStyle } from "react-native";

export const colors = {
  background: "#EFEAE1",
  card: "#FBF8F3",
  ink: "#1A2420",
  muted: "#5E6A64",
  line: "#D9D2C6",
  green: "#1F4D3A",
  greenDark: "#17392B",
  onGreen: "#F6F3EC",
  danger: "#8E3428",
  dangerBg: "#F8EBE6",
  dangerLine: "#E7C7BE",
  warn: "#8A5A12",
  warnBg: "#F8F0DC",
  white: "#FFFFFF",
};

export const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

export const screen: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
};

export const headline: TextStyle = {
  fontFamily: serif,
  fontSize: 34,
  lineHeight: 40,
  color: colors.ink,
};
