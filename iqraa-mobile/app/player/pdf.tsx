import { PDFViewer } from "@/components/players/pdf-viewer";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PDFViewerScreen() {
  const router = useRouter();
  const { url, title } = useLocalSearchParams<{
    url: string;
    title?: string;
  }>();

  return (
    <PDFViewer url={url || ""} title={title} onClose={() => router.back()} />
  );
}
