import ImageThumbnail from "./ImageThumbnail";

interface UploadedImage {
    file: File;
    preview: string;
    hasGeotag: boolean;
    isSelected: boolean;
}

interface ImageGridProps {
    images: UploadedImage[];
    onRemove: (index: number) => void;
    onSelect: (index: number) => void;
}

export default function ImageGrid({ images, onRemove, onSelect }: ImageGridProps) {
    return (
        <div className="h-[500px] w-full rounded-md border p-4 bg-muted/20 overflow-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                    <ImageThumbnail
                        key={index}
                        file={image.file}
                        preview={image.preview}
                        hasGeotag={image.hasGeotag}
                        onRemove={() => onRemove(index)}
                        onSelect={() => onSelect(index)}
                        isSelected={image.isSelected}
                    />
                ))}
            </div>
        </div>
    );
}
