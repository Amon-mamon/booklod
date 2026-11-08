import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { C } from "@/theme";
import type { ReadingDigest } from "@/types/booklod";

export function niceMax(n: number) {
  if (n <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const norm = n / pow;
  const step = norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return Math.ceil(n / (step * pow)) * step * pow;
}

const CHART_HEIGHT = 160;
const AXIS_WIDTH = 22;

/** Finished (orange) vs reading (green) per month — same as the web chart. */
export function MonthlyBarChart({ months }: { months: ReadingDigest["months"] }) {
  const rawMax = Math.max(0, ...months.map((m) => Math.max(m.finished, m.reading)));
  const top = niceMax(rawMax);
  const tickCount = Math.min(5, top);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((top / tickCount) * i));

  return (
    <View accessible accessibilityLabel={`Books by month: ${months.map((m) => `${m.label} ${m.finished} finished, ${m.reading} reading`).join("; ")}`}>
      <View style={{ flexDirection: "row", height: CHART_HEIGHT }}>
        <View style={styles.axis}>
          {[...ticks].reverse().map((t) => (
            <AppText key={t} size={10} color={C.muted} style={{ lineHeight: 10 }}>
              {t}
            </AppText>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          {ticks.map((t) => (
            <View key={t} style={[styles.gridLine, { bottom: `${(t / top) * 100}%` }]} />
          ))}
          <View style={styles.bars}>
            {months.map((m) => (
              <View key={m.month} style={styles.barGroup}>
                <View style={[styles.bar, { height: `${(m.finished / top) * 100}%`, backgroundColor: m.finished ? C.orange : "transparent" }]} />
                <View style={[styles.bar, { height: `${(m.reading / top) * 100}%`, backgroundColor: m.reading ? C.green : "transparent" }]} />
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", marginTop: 6, marginLeft: AXIS_WIDTH }}>
        {months.map((m) => (
          <View key={m.month} style={{ flex: 1, alignItems: "center" }}>
            <AppText weight="medium" size={9}>
              {m.label}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  axis: { width: AXIS_WIDTH, paddingRight: 6, justifyContent: "space-between", alignItems: "flex-end" },
  gridLine: { position: "absolute", left: 0, right: 0, borderTopWidth: 1, borderStyle: "dashed", borderColor: C.tan },
  bars: { ...StyleSheet.absoluteFill, flexDirection: "row", alignItems: "flex-end" },
  barGroup: { flex: 1, height: "100%", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 3 },
  bar: { width: 6, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
});
