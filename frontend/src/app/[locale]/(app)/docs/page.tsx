import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function DocsPage() {
  // Path to the backend documentation file
  // We assume the backend is a sibling of the frontend folder
  const docsPath = path.join(process.cwd(), "../backend/API_DOCUMENTATION.md");

  let content = "";
  try {
    content = fs.readFileSync(docsPath, "utf8");
  } catch (error) {
    console.error("Error reading docs file:", error);
    content = "# Error\n\nCould not load documentation file.";
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
