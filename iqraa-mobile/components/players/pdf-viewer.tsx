import { COLORS } from "@/constants/theme";
import { ArrowLeftIcon } from "phosphor-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { WebView } from "react-native-webview";

interface PDFViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
  bookId?: string;
}

/**
 * Inline PDF Viewer using WebView with Google Docs viewer.
 * This approach works with Expo Go and doesn't require native modules.
 */
export function PDFViewer({ url, title, onClose, bookId }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Use Google Docs viewer for PDF rendering
  const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

  return (
    <View className="flex-1 bg-slate-100">
      {/* Header Controls */}
      <View className="h-14 px-4 flex-row items-center justify-between bg-white border-b border-slate-200">
        <Pressable
          onPress={onClose}
          className="w-10 h-10 items-center justify-center"
        >
          <ArrowLeftIcon size={24} color="#64748B" />
        </Pressable>

        <Text
          className="flex-1 text-center font-semibold text-slate-900 mx-2"
          numberOfLines={1}
        >
          {title || "PDF Document"}
        </Text>

        {/* Placeholder for potential zoom controls */}
        <View className="w-10" />
      </View>

      {/* PDF WebView */}
      <View className="flex-1">
        <WebView
          source={{ uri: googleDocsUrl }}
          style={{ flex: 1 }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          scalesPageToFit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View className="absolute inset-0 items-center justify-center bg-slate-100">
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text className="text-slate-500 mt-4 font-medium">
                Loading PDF...
              </Text>
            </View>
          )}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View className="absolute inset-0 items-center justify-center bg-slate-100">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text className="text-slate-500 mt-4 font-medium">
              Loading PDF...
            </Text>
            <Text className="text-slate-400 text-sm mt-2">
              This may take a moment
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Toolbar (optional page controls) */}
      <View className="h-16 px-4 flex-row items-center justify-center gap-4 bg-white border-t border-slate-200">
        <Text className="text-xs text-slate-500">
          Pinch to zoom • Scroll to navigate
        </Text>
      </View>
    </View>
  );
}

/**
 * Opens a PDF in the system browser (alternative approach).
 */
export async function openPDFInBrowser(url: string) {
  const { openBrowserAsync } = await import("expo-web-browser");
  await openBrowserAsync(url);
}
