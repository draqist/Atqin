import { Image } from "expo-image";
import { BellIcon, ListIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";

export function Header() {
  return (
    <View className="flex-row items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
      {/* Left: Logo */}
      <View>
        <Image
          source={require("../../assets/images/icon.png")} // Fallback or use a placeholder if file missing
          style={{ width: 32, height: 32 }}
          contentFit="contain"
          // If real logo not available, we can mock it or use an Icon
        />
        {/* Fallback View if image fails (for dev) - simplified for now */}
      </View>

      {/* Right: Actions */}
      <View className="flex-row items-center gap-4">
        <TouchableOpacity>
          <BellIcon size={24} color="#64748B" weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity>
          <ListIcon size={24} color="#64748B" weight="regular" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
