import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { BarChart2 } from "lucide-react-native";
import { digestApi } from "@/api/endpoints";
import { errorMessage } from "@/api/client";
import { AppHeader, Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Banner, Card, EmptyState, LoadingView } from "@/components/ui/primitives";
import { queryKeys } from "@/features/library/hooks/useLibrary";
import { C, radius } from "@/theme";
import { fmtDate } from "@/utils/dates";
import { MonthlyBarChart } from "../components/MonthlyBarChart";

export function DigestScreen() {
  const year = new Date().getFullYear();
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.digest(year),
    queryFn: () => digestApi.get(year),
  });

  return (
    <Screen>
      <AppHeader showAdd />
      {isLoading ? (
        <LoadingView />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={C.green} />}
        >
          <AppText weight="semibold" size={20}>
            {year} Reading Digest
          </AppText>
          <AppText color={C.muted} style={{ marginBottom: 20 }}>
            Your year in books, at a glance.
          </AppText>

          {error || !data ? (
            <Banner message={errorMessage(error, "Unable to load your digest.")} onRetry={refetch} />
          ) : (
            <>
              <View style={styles.stats}>
                <StatCard number={data.totals.finished} label="Finished" color={C.orange} tint={C.orangeT} />
                <StatCard number={data.totals.reading} label="Reading" color={C.green} tint={C.greenT} />
                <StatCard number={data.totals.toRead} label="To Read" color={C.navy} tint={C.navyT} />
                <StatCard number={data.totals.lentOut} label="Lent Out" color={C.navy} tint={C.white} bordered />
              </View>

              <Card style={{ padding: 16, marginBottom: 24 }}>
                <View style={styles.chartHeader}>
                  <AppText weight="semibold">Books by Month</AppText>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <Legend color={C.orange} label="Finished" />
                    <Legend color={C.green} label="Reading" />
                  </View>
                </View>
                <MonthlyBarChart months={data.months} />
              </Card>

              <AppText weight="semibold" size={12} color={C.subtle} style={styles.caps}>
                Finished this year
              </AppText>
              {data.finished.length === 0 ? (
                <EmptyState icon={BarChart2} title="Nothing finished yet this year" subtitle="Mark a book Done Reading and it'll show up here." />
              ) : (
                <View style={{ gap: 8 }}>
                  {data.finished.map((b) => (
                    <Pressable key={b.id} onPress={() => router.push(`/books/${b.id}`)} style={styles.finishedRow} accessibilityRole="button">
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <AppText weight="medium" numberOfLines={1}>
                          {b.title}
                        </AppText>
                        {b.author ? (
                          <AppText size={12} color="#8A8580" numberOfLines={1}>
                            {b.author}
                          </AppText>
                        ) : null}
                      </View>
                      <AppText size={12} color={C.subtle}>
                        {fmtDate(b.endDate)}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

function StatCard({ number, label, color, tint, bordered }: { number: number; label: string; color: string; tint: string; bordered?: boolean }) {
  return (
    <View style={[styles.stat, { backgroundColor: tint, borderWidth: bordered ? 1 : 0 }]}>
      <AppText weight="medium" size={12} color={color}>
        {label}
      </AppText>
      <AppText weight="semibold" size={24}>
        {number}
      </AppText>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
      <AppText size={12}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  stat: { width: "47.5%", flexGrow: 1, borderRadius: radius.lg, padding: 16, borderColor: C.tan },
  chartHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  caps: { textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 },
  finishedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.tan,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
