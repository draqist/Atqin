import { COLORS } from "@/constants/theme";
import { PlayCircleIcon } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface FloatingMediaButtonProps {
  count: number;
  onPress: () => void;
}

/**
 * A floating action button for accessing video resources.
 * Shows a badge with the video count.
 */
export function FloatingMediaButton({
  count,
  onPress,
}: FloatingMediaButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  if (count === 0) return null;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          bottom: 100,
          right: 16,
          zIndex: 50,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: COLORS.primary,
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <PlayCircleIcon size={28} color="white" weight="fill" />

        {/* Badge */}
        <View
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            backgroundColor: "#EF4444",
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 4,
            borderWidth: 2,
            borderColor: "white",
          }}
        >
          <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
            {count}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
