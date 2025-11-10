import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export default function UploadZone({ onFilesSelected }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
    },
    multiple: true,
    onDrop: onFilesSelected,
  });

  return (
    <Card
      {...getRootProps()}
      className={`p-8 border-2 border-dashed cursor-pointer transition-colors ${
        isDragActive ? "border-primary bg-primary/5" : "border-border hover-elevate"
      }`}
      data-testid="card-upload-zone"
    >
      <input {...getInputProps()} data-testid="input-file-upload" />
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          {isDragActive ? (
            <ImageIcon className="w-8 h-8 text-primary" data-testid="icon-drag-active" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" data-testid="icon-upload" />
          )}
        </div>
        <div>
          <p className="text-base font-medium mb-1" data-testid="text-upload-title">
            {isDragActive ? "Drop your photos here" : "Drag & drop photos here"}
          </p>
          <p className="text-sm text-muted-foreground" data-testid="text-upload-subtitle">
            or click to browse
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {["JPG", "PNG", "WebP", "HEIC"].map((format) => (
            <span
              key={format}
              className="px-2 py-1 bg-muted text-xs font-medium rounded-md"
              data-testid={`badge-format-${format.toLowerCase()}`}
            >
              {format}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
