"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useAddNode,
  useDeleteNode,
  useReorderNodes,
} from "@/lib/hooks/mutations/roadmaps";
import { useBooks } from "@/lib/hooks/queries/books";
import { toast } from "@/lib/toast";
import { Roadmap } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Check,
  Eye,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { RoadmapPreview } from "./roadmap/roadmap-preview";
import { SortableBook } from "./roadmap/sortable-book";

// Internal type for state management
type RoadmapLevels = {
  [key: string]: string[]; // Level ID -> Array of Book IDs
};

const LEVEL_CONFIG = [
  { id: "beginner", title: "Level 1: Beginner", color: "bg-emerald-500" },
  { id: "intermediate", title: "Level 2: Intermediate", color: "bg-amber-500" },
  { id: "advanced", title: "Level 3: Advanced", color: "bg-red-500" },
];

export function RoadmapBuilder({ roadmap }: { roadmap: Roadmap }) {
  const { data: allBooks } = useBooks();
  const [search, setSearch] = useState("");

  // Mutations
  const { mutate: addNode } = useAddNode(roadmap.id);
  const { mutate: deleteNode } = useDeleteNode(roadmap.id);

  // Local State for Drag and Drop
  const [items, setItems] = useState<RoadmapLevels>({
    beginner: [],
    intermediate: [],
    advanced: [],
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  // 1. Sync DB Data to Local State
  useEffect(() => {
    if (roadmap.nodes) {
      const newItems: RoadmapLevels = {
        beginner: [],
        intermediate: [],
        advanced: [],
      };

      // Sort nodes by sequence first
      const sortedNodes = [...roadmap.nodes].sort(
        (a, b) => a.sequence_index - b.sequence_index
      );

      sortedNodes.forEach((node) => {
        if (newItems[node.level]) {
          // We store Book IDs in the local state for dragging
          // In a real app, you might need a map to track Node ID vs Book ID
          // For simplicity here, we assume 1 Book = 1 Node
          newItems[node.level].push(node.book_id);
        }
      });
      setItems(newItems);
    }
  }, [roadmap]);

  // 2. Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // 5px movement before drag starts
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 3. Helper: Check duplicates
  const isBookInRoadmap = useCallback(
    (bookId: string) => {
      return Object.values(items).some((levelBooks) =>
        levelBooks.includes(bookId)
      );
    },
    [items]
  );

  // 4. Handlers
  const handleAddBook = (bookId: string, levelId: string) => {
    if (isBookInRoadmap(bookId)) {
      toast.error("This book is already in the roadmap");
      return;
    }

    // Optimistic Update
    setItems((prev) => ({
      ...prev,
      [levelId]: [...prev[levelId], bookId],
    }));

    // Server Update
    const currentCount = items[levelId].length;
    addNode({
      book_id: bookId,
      level: levelId,
      sequence_index: currentCount + 1,
      description: "",
    });
  };

  const handleRemoveBook = (bookId: string, levelId: string) => {
    // Optimistic
    setItems((prev) => ({
      ...prev,
      [levelId]: prev[levelId].filter((id) => id !== bookId),
    }));

    // Server
    // We need to find the NODE ID that corresponds to this BOOK ID
    const nodeToDelete = roadmap.nodes?.find(
      (n) => n.book_id === bookId && n.level === levelId
    );
    if (nodeToDelete) {
      deleteNode(nodeToDelete.id);
    }
  };

  // --- DND LOGIC ---

  const findContainer = (id: string) => {
    if (id in items) return id;
    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    // Moving BETWEEN containers (Visual update only during drag)
    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.indexOf(active.id as string);
      const overIndex = overItems.indexOf(overId as string);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item !== active.id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over?.id as string);

    if (
      activeContainer &&
      overContainer &&
      (activeContainer !== overContainer || active.id !== over?.id)
    ) {
      const activeIndex = items[activeContainer].indexOf(active.id as string);
      const overIndex = items[overContainer].indexOf(over?.id as string);

      // Final State Update
      setItems((prev) => ({
        ...prev,
        [activeContainer]: arrayMove(
          prev[activeContainer],
          activeIndex,
          overIndex
        ),
      }));

      // TODO: Send batch update to backend to save new order/levels
      toast.success("Order updated (Visual Only - Backend Sync needed)");
    }

    setActiveId(null);
  };

  // Search Filter
  const filteredLibrary =
    allBooks?.filter((b) =>
      b.title.toLowerCase().includes(search.toLowerCase())
    ) || [];
  const { mutate: saveOrder, isPending: isSaving } = useReorderNodes(
    roadmap.id
  );

  const handleSaveRoadmap = () => {
    // 1. Flatten the 'items' state into a list of updates
    const updates: any[] = [];

    Object.entries(items).forEach(([levelId, bookIds]) => {
      bookIds.forEach((bookId, index) => {
        // We need the NODE ID, not the BOOK ID.
        // Find the node that corresponds to this book.
        // If it's a newly added book that hasn't synced from DB yet, this might be tricky.
        // Ideally, 'items' should store Node Objects, not just Book IDs.

        const node = roadmap.nodes?.find((n) => n.book_id === bookId);
        if (node) {
          updates.push({
            node_id: node.id,
            level: levelId,
            sequence_index: index + 1,
          });
        }
      });
    });

    if (updates.length === 0) {
      toast.info("No changes to save");
      return;
    }

    saveOrder(updates);
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
        {/* LEFT: LIBRARY */}
        <Card className="lg:col-span-1 border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base font-semibold">
              Library Source
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search books..."
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-2">
                {filteredLibrary.map((book) => {
                  const isAdded = isBookInRoadmap(book.id);
                  return (
                    <div
                      key={book.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                        isAdded
                          ? "bg-slate-50 border-slate-100 opacity-60"
                          : "bg-white border-slate-200 hover:border-emerald-300"
                      )}
                    >
                      <div
                        className="truncate text-sm font-medium text-slate-700 mr-2 w-3/4"
                        title={book.title}
                      >
                        {book.title}
                      </div>

                      {/* SMART ADD BUTTON */}
                      {isAdded ? (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Added
                        </span>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {LEVEL_CONFIG.map((lvl) => (
                              <DropdownMenuItem
                                key={lvl.id}
                                onClick={() => handleAddBook(book.id, lvl.id)}
                              >
                                To {lvl.title}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* RIGHT: ROADMAP BOARD */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-y-auto pr-2">
          <div className="flex justify-end gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white">
                  <Eye className="w-4 h-4" /> Preview
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:max-w-none sm:w-[800px]  overflow-y-auto p-0">
                <RoadmapPreview
                  levels={LEVEL_CONFIG.map((l) => ({
                    ...l,
                    bookIds: items[l.id],
                  }))}
                  books={allBooks || []}
                  title={roadmap.title}
                />
              </SheetContent>
            </Sheet>
            <Button
              className="bg-slate-900 text-white gap-2"
              onClick={handleSaveRoadmap}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-6">
            {LEVEL_CONFIG.map((level) => (
              <Card
                key={level.id}
                className="border-slate-200 shadow-sm bg-slate-50/30 flex flex-col"
              >
                <CardHeader className="pb-3 px-4 flex flex-row items-center justify-between border-b border-slate-100/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${level.color}`} />
                    <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                      {level.title}
                    </CardTitle>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {items[level.id].length} Books
                  </span>
                </CardHeader>

                <CardContent className="p-4">
                  <SortableContext
                    id={level.id}
                    items={items[level.id]}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 min-h-[60px]">
                      {items[level.id].map((bookId) => {
                        const book = allBooks?.find((b) => b.id === bookId);
                        if (!book) return null;
                        return (
                          <SortableBook
                            key={bookId}
                            id={bookId}
                            title={book.title}
                            onRemove={() => handleRemoveBook(bookId, level.id)}
                          />
                        );
                      })}
                      {items[level.id].length === 0 && (
                        <div className="h-16 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                          Drop books here
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* DRAG OVERLAY (The Floating Ghost Card) */}
        <DragOverlay>
          {activeId ? (
            <Card className="p-3 flex items-center gap-3 bg-white border-emerald-400 shadow-xl rotate-2 w-[300px] cursor-grabbing opacity-90">
              <GripVertical className="w-4 h-4 text-slate-400" />
              <div className="flex-1 text-sm font-medium text-slate-900 truncate">
                {allBooks?.find((b) => b.id === activeId)?.title ||
                  "Moving Book..."}
              </div>
            </Card>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
