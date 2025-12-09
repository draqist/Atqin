import { BookJsonLd } from "@/components/seo/json-ld";
import { fetchBookById } from "@/lib/api/queries/books";
import { Metadata } from "next";
import StudyClientPage from "./client-page"; // Import the client component

// 1. Server-Side Metadata Generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookId: string }>;
}): Promise<Metadata> {
  const { bookId } = await params;
  const book = await fetchBookById(bookId);

  if (!book) return { title: "Book Not Found" };

  return {
    title: `${book.title} - Read & Memorize Online`,
    description:
      book.description?.slice(0, 160) ||
      `Study ${book.title} by ${book.original_author} on Iqraa.`,
    openGraph: {
      images: [book.cover_image_url || "/default-cover.jpg"],
    },
  };
}

// 2. The Server Component
export default async function StudyPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const book = await fetchBookById(bookId);

  return (
    <>
      {/* Inject JSON-LD for SEO */}
      {book && <BookJsonLd book={book} />}

      {/* Render the Client UI */}
      <StudyClientPage bookId={bookId} />
    </>
  );
}
