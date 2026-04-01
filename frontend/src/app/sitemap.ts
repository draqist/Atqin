import { fetchBooks } from '@/lib/api/queries/books';
import { fetchRoadmaps } from '@/lib/api/queries/roadmaps';
import { Book, Roadmap } from '@/lib/types';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://iqraa.space'; // Your real domain

  // 1. Fetch all dynamic data
  // (Ensure these API calls are cached or fast)
  // 1. Fetch all dynamic data
  // (Ensure these API calls are cached or fast)
  let books: { books: Book[]; metadata: any } = { books: [], metadata: {} };
  let roadmaps: Roadmap[] = [];

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Sitemap dynamic data fetch timed out')), 10000)
    );

    const [fetchedBooks, fetchedRoadmaps] = (await Promise.race([
      Promise.all([fetchBooks(), fetchRoadmaps()]),
      timeoutPromise,
    ])) as [{ books: Book[]; metadata: any }, Roadmap[]];

    books = fetchedBooks;
    roadmaps = fetchedRoadmaps;
  } catch (error) {
    console.warn('Failed to fetch dynamic data for sitemap:', error);
    // Proceed with empty arrays if fetch fails (e.g. during build without backend)
  }

  // 2. Map Books
  const bookUrls = (books?.books || []).map((book) => ({
    url: `${baseUrl}/library/${book.id}`,
    lastModified: new Date(book.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // 3. Map Roadmaps
  const roadmapUrls = (roadmaps || []).map((map) => ({
    url: `${baseUrl}/roadmaps/${map.slug}`,
    lastModified: new Date(map.created_at),
    changeFrequency: 'weekly' as const, // Roadmaps update more often
    priority: 0.9,
  }));

  // 4. Static Routes
  const staticRoutes = [
    '',
    '/library',
    '/roadmaps',
    '/reflections',
    '/about',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  return [...staticRoutes, ...bookUrls, ...roadmapUrls];
}