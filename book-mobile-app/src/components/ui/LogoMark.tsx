import Svg, { Rect } from "react-native-svg";
import { View } from "react-native";
import { C } from "@/theme";
import { AppText } from "./AppText";

/** Same three-book logo as the web app. */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 80 72" fill="none" accessibilityElementsHidden>
      <Rect x="6" y="6" width="18" height="52" rx="4" fill="#000000" />
      <Rect x="9" y="16" width="8" height="3" rx="1.5" fill={C.cream} />
      <Rect x="29" y="14" width="18" height="44" rx="4" fill={C.green} />
      <Rect x="32" y="22" width="8" height="3" rx="1.5" fill={C.cream} />
      <Rect x="49" y="8" width="18" height="50" rx="4" fill={C.orange} transform="rotate(8 58 33)" />
      <Rect x="52" y="18" width="8" height="3" rx="1.5" fill={C.cream} transform="rotate(8 58 33)" />
      <Rect x="4" y="62" width="72" height="5" rx="2.5" fill="#000000" />
    </Svg>
  );
}

export function Wordmark({ size = 18 }: { size?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }} accessibilityRole="header" accessibilityLabel="Booklod">
      <LogoMark size={30} />
      <AppText weight="bold" size={size}>
        Book<AppText weight="bold" size={size} color={C.green}>l</AppText>
        <AppText weight="bold" size={size} color={C.orange}>od</AppText>
      </AppText>
    </View>
  );
}
