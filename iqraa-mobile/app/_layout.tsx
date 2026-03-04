import { AnimatedSplash } from "@/components/ui/animated-splash";
import { initializeAuth } from "@/hooks/use-auth-mobile";
import { hasCompletedOnboarding } from "@/lib/storage/onboarding";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import "../global.css";

// Initialize QueryClient outside component to prevent recreation
const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Check auth and onboarding status
  useEffect(() => {
    async function prepare() {
      try {
        // Check onboarding status
        const onboardingDone = await hasCompletedOnboarding();

        if (!onboardingDone) {
          setInitialRoute("/onboarding");
        } else {
          // Check if user is authenticated
          const isAuthenticated = await initializeAuth();
          setInitialRoute(isAuthenticated ? "/(tabs)" : "/(auth)/login");
        }

        // Small delay for smooth transition
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
        setInitialRoute("/(auth)/login");
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  // Handle initial navigation after splash
  useEffect(() => {
    if (splashAnimationFinished && initialRoute) {
      router.replace(initialRoute as any);
    }
  }, [splashAnimationFinished, initialRoute]);

  // When animation is COMPLETELY done, hide native splash
  const onLayoutRootView = async () => {
    if (splashAnimationFinished) {
      await SplashScreen.hideAsync();
    }
  };

  if (!splashAnimationFinished) {
    return (
      <AnimatedSplash
        isAppReady={appIsReady}
        onAnimationFinish={() => setSplashAnimationFinished(true)}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="library/[id]" />
          <Stack.Screen name="bookmarks" />
          <Stack.Screen name="player/youtube" />
          <Stack.Screen name="player/pdf" />
        </Stack>
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
            },
          }}
        />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
