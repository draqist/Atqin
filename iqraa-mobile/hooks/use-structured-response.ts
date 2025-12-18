import { Resource } from '@/lib/types';
import { useMemo } from 'react';

export function useStructuredResources(resources: Resource[] | undefined) {
  return useMemo(() => {
    // Return empty array if data is loading or undefined
    if (!resources) return [];

    const playlists: Resource[] = [];
    const standalone: Resource[] = [];
    const childrenMap: Record<string, Resource[]> = {};

    // First pass: Separate parents and map children
    resources.forEach((r) => {
      if (r.type === 'playlist') {
        // Initialize playlists with an empty children array
        playlists.push({ ...r, children: [] });
      } else if (r.parent_id) {
        // Group children by their parent_id
        if (!childrenMap[r.parent_id]) {
          childrenMap[r.parent_id] = [];
        }
        childrenMap[r.parent_id].push(r);
      } else {
        // Items that are neither playlists nor inside a playlist
        standalone.push(r);
      }
    });

    // Second pass: Attach children to their specific playlists
    playlists.forEach((p) => {
      if (childrenMap[p.id]) {
        // Sort children by sequence_index to ensure Ep 1 comes before Ep 2
        p.children = childrenMap[p.id].sort((a, b) => a.sequence_index - b.sequence_index);
      }
    });

    // Return playlists first (usually user wants to see courses at top), then standalone items
    return [...playlists, ...standalone];
  }, [resources]);
}