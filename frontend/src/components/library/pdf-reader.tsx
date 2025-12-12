import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { PdfError } from "./pdf-error";
import { PdfSkeleton } from "./pdf-skeleton";

export default function PDFReader({ url }: { url: string }) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <div style={{}}>
        <Viewer
          fileUrl={url}
          renderLoader={PdfSkeleton}
          renderError={PdfError}
        />
      </div>
    </Worker>
  );
}
