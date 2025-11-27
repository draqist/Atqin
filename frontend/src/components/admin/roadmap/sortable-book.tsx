import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

export function SortableBook({
  id,
  title,
  onRemove,
}: {
  id: string;
  title: string;
  onRemove?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2 group relative">
      <Card className="p-3 flex items-center gap-3 bg-white hover:border-emerald-400 transition-colors shadow-sm border-slate-200">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-slate-400 hover:text-slate-600"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 text-sm font-medium text-slate-900 truncate">
          {title}
        </div>

        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </Card>
    </div>
  );
}
