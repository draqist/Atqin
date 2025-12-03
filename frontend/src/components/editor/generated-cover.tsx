/**
 * Generates a deterministic abstract cover image based on the book title.
 * Used as a fallback when no cover image is provided.
 */
export function GeneratedCover({ title }: { title: string }) {
  // Simple deterministic pattern based on title length/char codes
  // In production, use a proper hashing function or library like 'geopattern'
  const colors = [
    "from-emerald-400 to-cyan-500",
    "from-indigo-400 to-purple-500",
    "from-orange-400 to-rose-500",
    "from-blue-400 to-emerald-500",
  ];

  const colorClass = colors[title.length % colors.length] || colors[0];

  return (
    <div
      className={`w-full h-48 md:h-64 rounded-b-[2.5rem] bg-linear-to-br ${colorClass} relative overflow-hidden`}
    >
      {/* Abstract Shapes */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
    </div>
  );
}
