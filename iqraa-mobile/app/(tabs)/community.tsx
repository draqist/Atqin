import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] items-center justify-center">
      <Text className="text-slate-800 font-bold text-xl">Community</Text>
    </SafeAreaView>
  );
}
