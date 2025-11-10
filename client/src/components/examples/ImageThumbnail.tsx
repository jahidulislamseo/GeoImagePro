import ImageThumbnail from "../ImageThumbnail";

export default function ImageThumbnailExample() {
  const mockFile = new File([""], "sample-photo.jpg", { type: "image/jpeg" });
  Object.defineProperty(mockFile, "size", { value: 2048000 });

  return (
    <div className="w-48">
      <ImageThumbnail
        file={mockFile}
        preview="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
        hasGeotag={true}
        onRemove={() => console.log("Remove clicked")}
        onSelect={() => console.log("Select clicked")}
        isSelected={false}
      />
    </div>
  );
}
