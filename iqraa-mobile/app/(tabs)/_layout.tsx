import { COLORS } from "@/constants/theme";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

// Import the premium icons
import {
  BooksIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  MapTrifoldIcon,
  UserCircleIcon,
  UsersIcon,
} from "phosphor-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === "ios" ? 85 : 65,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0.05,
          shadowRadius: 10,
          paddingTop: 10,
        },
        tabBarItemStyle: {
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <CircleTabIcon Icon={HouseIcon} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({ focused }) => (
            <CircleTabIcon Icon={BooksIcon} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="roadmaps"
        options={{
          tabBarIcon: ({ focused }) => (
            <CircleTabIcon Icon={MapTrifoldIcon} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Hidden - search is available on Library page
          tabBarIcon: ({ focused }) => (
            <CircleTabIcon Icon={MagnifyingGlassIcon} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ focused }) => (
            <CircleTabIcon Icon={UsersIcon} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <CircleTabIcon Icon={UserCircleIcon} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

// 🎨 The Renderer
// Now accepts a Phosphor Icon Component prop
function CircleTabIcon({ Icon, focused }: { Icon: any; focused: boolean }) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          {
            backgroundColor: focused ? "#ECFDF5" : "transparent",
          },
        ]}
      >
        {/* weight="fill" gives that solid, confident look when active.
            weight="regular" keeps it airy and clean when inactive.
        */}
        <Icon
          size={26}
          color={focused ? COLORS.primary : "#94A3B8"}
          weight={focused ? "fill" : "regular"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
