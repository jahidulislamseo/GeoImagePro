import { CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BatchControlsProps {
  totalImages: number;
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onApplyToSelected: () => void;
}

export default function BatchControls({
  totalImages,
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onApplyToSelected,
}: BatchControlsProps) {
  const allSelected = selectedCount === totalImages && totalImages > 0;

  return (
    <Card data-testid="card-batch-controls">
      <CardContent className="py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={allSelected ? onDeselectAll : onSelectAll}
              disabled={totalImages === 0}
              data-testid="button-toggle-select-all"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 mr-2" />
              ) : (
                <Square className="w-4 h-4 mr-2" />
              )}
              {allSelected ? "Deselect All" : "Select All"}
            </Button>
            <span className="text-sm text-muted-foreground" data-testid="text-selection-count">
              {selectedCount} of {totalImages} selected
            </span>
          </div>
          <Button
            size="sm"
            onClick={onApplyToSelected}
            disabled={selectedCount === 0}
            data-testid="button-apply-to-selected"
          >
            Apply to {selectedCount} Image{selectedCount !== 1 ? "s" : ""}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
