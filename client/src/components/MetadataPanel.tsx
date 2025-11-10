import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import CoordinateInput from "./CoordinateInput";

interface MetadataPanelProps {
  latitude: number;
  longitude: number;
  keywords: string;
  description: string;
  documentName: string;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
  onKeywordsChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDocumentNameChange: (value: string) => void;
  onWriteExif: () => void;
  onDownload: () => void;
  onClear: () => void;
}

export default function MetadataPanel({
  latitude,
  longitude,
  keywords,
  description,
  documentName,
  onLatitudeChange,
  onLongitudeChange,
  onKeywordsChange,
  onDescriptionChange,
  onDocumentNameChange,
  onWriteExif,
  onDownload,
  onClear,
}: MetadataPanelProps) {
  return (
    <Card data-testid="card-metadata-panel">
      <CardHeader>
        <CardTitle className="text-lg" data-testid="text-panel-title">
          Image Metadata
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium" data-testid="label-geotags">
            New Geotags
          </Label>
          <CoordinateInput
            latitude={latitude}
            longitude={longitude}
            onLatitudeChange={onLatitudeChange}
            onLongitudeChange={onLongitudeChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document-name" data-testid="label-document-name">
            Document Name
            <span className="text-xs text-muted-foreground ml-2">EXIF</span>
          </Label>
          <Input
            id="document-name"
            value={documentName}
            onChange={(e) => onDocumentNameChange(e.target.value)}
            placeholder="Enter document name"
            data-testid="input-document-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords" data-testid="label-keywords">
            Keywords and Tags
            <span className="text-xs text-muted-foreground ml-2">Max 6,600 chars</span>
          </Label>
          <Textarea
            id="keywords"
            value={keywords}
            onChange={(e) => onKeywordsChange(e.target.value)}
            placeholder="landscape, mountain, sunset, nature"
            className="min-h-[80px] resize-none"
            maxLength={6600}
            data-testid="textarea-keywords"
          />
          <p className="text-xs text-muted-foreground text-right" data-testid="text-keywords-count">
            {keywords.length} / 6,600
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" data-testid="label-description">
            Description / Alternative Text
            <span className="text-xs text-muted-foreground ml-2">Max 1,300 chars</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="A beautiful sunset over the mountains..."
            className="min-h-[100px] resize-none"
            maxLength={1300}
            data-testid="textarea-description"
          />
          <p className="text-xs text-muted-foreground text-right" data-testid="text-description-count">
            {description.length} / 1,300
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Button
            className="w-full"
            onClick={onWriteExif}
            data-testid="button-write-exif"
          >
            <FileText className="w-4 h-4 mr-2" />
            Write EXIF Tags
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={onDownload}
              data-testid="button-download"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={onClear}
              data-testid="button-clear"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
