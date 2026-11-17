import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getSavedItems, removeSavedItem, saveItem, type SavedItem } from "@/lib/api";

type Props = Omit<SavedItem, "id" | "savedAt"> & { size?: "sm" | "icon"; className?: string };

export function BookmarkButton({ size = "sm", className, ...item }: Props) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["saved"], queryFn: getSavedItems });
  const existing = data?.find((x) => x.type === item.type && x.refId === item.refId);
  const toggle = async () => {
    if (existing) {
      await removeSavedItem(existing.id);
      toast("Removed from Saved");
    } else {
      await saveItem(item);
      toast.success("Saved");
    }
    qc.invalidateQueries({ queryKey: ["saved"] });
  };
  const Icon = existing ? BookmarkCheck : Bookmark;
  const label = existing ? `Remove "${item.title}" from Saved` : `Save "${item.title}"`;
  return (
    <Button
      variant="outline"
      size={size === "icon" ? "icon" : "sm"}
      onClick={toggle}
      aria-label={label}
      aria-pressed={!!existing}
      className={className}
    >
      <Icon className="h-4 w-4" />
      {size !== "icon" && <span className="ml-1">{existing ? "Saved" : "Save"}</span>}
    </Button>
  );
}
