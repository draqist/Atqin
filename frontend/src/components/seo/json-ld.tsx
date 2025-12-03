export function BookJsonLd({ book }: { book: any }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: {
      "@type": "Person",
      name: book.original_author,
    },
    description: book.description,
    image: book.cover_image_url,
    inLanguage: ["en", "ar"],
    url: `https://atqin.vercel.app/library/${book.id}`,
    potentialAction: {
      "@type": "ReadAction",
      target: `https://atqin.vercel.app/library/${book.id}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
