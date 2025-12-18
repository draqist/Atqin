import { AnimatedSplash } from "@/components/ui/animated-splash";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import "../global.css";

// Initialize Client
const queryClient = new QueryClient();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);

  // Load Fonts & Resources
  // const [fontsLoaded] = useFonts({
  // });

  useEffect(() => {
    async function prepare() {
      try {
        // Mock API/Auth loading time (Replace with real logic later)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the component "We are ready to fade out"
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  // When animation is COMPLETELY done, hide native splash to be safe
  const onLayoutRootView = async () => {
    if (splashAnimationFinished) {
      await SplashScreen.hideAsync();
    }
  };

  if (!splashAnimationFinished) {
    return (
      <AnimatedSplash
        isAppReady={appIsReady} // Wait for fonts + logic
        onAnimationFinish={() => setSplashAnimationFinished(true)} // Unmount me
      />
    );
  }
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </QueryClientProvider>
  );
}
