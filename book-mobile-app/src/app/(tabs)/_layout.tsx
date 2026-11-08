import { Tabs } from "expo-router";
import { BarChart2, Library, User } from "lucide-react-native";
import { C, fonts } from "@/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.orange,
        tabBarInactiveTintColor: C.subtle,
        tabBarStyle: { backgroundColor: C.white, borderTopColor: C.tan },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        sceneStyle: { backgroundColor: C.cream },
      }}
    >
      <Tabs.Screen name="library" options={{ title: "Library", tabBarIcon: ({ color }) => <Library size={19} color={color} /> }} />
      <Tabs.Screen name="digest" options={{ title: "Digest", tabBarIcon: ({ color }) => <BarChart2 size={19} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color }) => <User size={19} color={color} /> }} />
    </Tabs>
  );
}
