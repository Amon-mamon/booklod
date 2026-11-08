import { Text, type TextProps } from "react-native";
import { C, fonts, type FontWeight } from "@/theme";

interface AppTextProps extends TextProps {
  weight?: FontWeight;
  size?: number;
  color?: string;
}

/** Text in Poppins, the same typeface as the web app. */
export function AppText({ weight = "regular", size = 14, color = C.navy, style, ...rest }: AppTextProps) {
  return <Text {...rest} style={[{ fontFamily: fonts[weight], fontSize: size, color }, style]} />;
}
