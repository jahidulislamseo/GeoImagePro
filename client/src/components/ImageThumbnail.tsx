import { X, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ImageThumbnailProps {
  file: File;
  preview: string;
  hasGeotag?: boolean;
  onRemove: () => void;
  onSelect: () => void;
  isSelected?: boolean;
}

export default function ImageThumbnail({
  file,
  preview,
  hasGeotag,
  onRemove,
  onSelect,
  isSelected,
}: ImageThumbnailProps) {
  return (
    <Card
      className={`relative overflow-hidden cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-primary" : ""
      } hover-elevate`}
      onClick={onSelect}
      data-testid={`card-thumbnail-${file.name}`}
    >
      <div className="aspect-square relative">
        <img
          src={preview}
          alt={file.name}
          className="w-full h-full object-cover"
          data-testid={`img-preview-${file.name}`}
        />
        {hasGeotag && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Tagged
          </div>
        )}
        <Button
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          data-testid={`button-remove-${file.name}`}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="p-2">
        <p className="text-xs truncate" data-testid={`text-filename-${file.name}`}>
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground" data-testid={`text-filesize-${file.name}`}>
          {(file.size / 1024).toFixed(1)} KB
        </p>
      </div>
    </Card>
  );
}
