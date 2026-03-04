import { COLORS } from "@/constants/theme";
import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

interface Props {
  onAnimationFinish: () => void;
  isAppReady: boolean;
}

export const AnimatedSplash = ({ onAnimationFinish, isAppReady }: Props) => {
  // Use React Native's built-in Animated API for better compatibility
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animation
    Animated.timing(scale, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isAppReady) {
      // Exit animation after delay
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onAnimationFinish();
        });
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [isAppReady, onAnimationFinish]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
        <Image
          source={require("../../assets/images/iqraa-white.png")}
          style={{ width: 100, height: 100 }}
          contentFit="contain"
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    zIndex: 99999,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 100,
  },
});
