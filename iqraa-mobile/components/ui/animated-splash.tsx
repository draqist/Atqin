import { COLORS } from "@/constants/theme";
import { Image } from "expo-image";
import { useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface Props {
  onAnimationFinish: () => void;
  isAppReady: boolean;
}

export const AnimatedSplash = ({ onAnimationFinish, isAppReady }: Props) => {
  // Animation Values
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Entrance Animation (Logo breathes in)
    scale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });
    textOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
  }, []);

  useEffect(() => {
    // 2. Exit Animation (Only triggers when App is Ready)
    if (isAppReady) {
      // Slight delay to let the user appreciate the logo
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 800 }, (finished) => {
          if (finished) {
            runOnJS(onAnimationFinish)();
          }
        });
        // Scale up wildly while fading out for a "Portal" effect
        scale.value = withTiming(5, { duration: 800 });
      }, 1500);
    }
  }, [isAppReady]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Animated.View style={[styles.content, animatedIconStyle]}>
        {/* LOGO: Replace with your Image if you have one */}
        <Image
          source={require("../../assets/images/iqraa-white.png")}
          style={{ width: 100, height: 100 }}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // Cover EVERYTHING
    backgroundColor: COLORS.primary, // Emerald Green Background
    zIndex: 99999, // Stay on top
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 100,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 4, // Expensive look
    fontFamily: "serif", // Uses system serif (Times/Georgia) for elegance
  },
  subtitle: {
    fontSize: 14,
    color: "#A7F3D0", // Light Emerald
    marginTop: 5,
    letterSpacing: 2,
    fontWeight: "500",
  },
});
