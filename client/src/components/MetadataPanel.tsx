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
  imageTitle: string;
  caption: string;
  locationName: string;
  subject: string;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
  onKeywordsChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDocumentNameChange: (value: string) => void;
  onImageTitleChange: (value: string) => void;
  onCaptionChange: (value: string) => void;
  onLocationNameChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
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
  imageTitle,
  caption,
  locationName,
  subject,
  onLatitudeChange,
  onLongitudeChange,
  onKeywordsChange,
  onDescriptionChange,
  onDocumentNameChange,
  onImageTitleChange,
  onCaptionChange,
  onLocationNameChange,
  onSubjectChange,
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

        {/* SEO Metadata Fields */}
        <div className="space-y-4 pt-4 border-t">
          <Label className="text-sm font-medium text-primary">
            🔍 SEO Metadata
          </Label>
          
          <div className="space-y-2">
            <Label htmlFor="image-title" data-testid="label-image-title">
              Image Title
              <span className="text-xs text-muted-foreground ml-2">SEO Important</span>
            </Label>
            <Input
              id="image-title"
              value={imageTitle}
              onChange={(e) => onImageTitleChange(e.target.value)}
              placeholder="Beautiful sunset at Cox's Bazar beach"
              data-testid="input-image-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption" data-testid="label-caption">
              Caption
              <span className="text-xs text-muted-foreground ml-2">Short description</span>
            </Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="Golden hour at the longest sea beach"
              data-testid="input-caption"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-name" data-testid="label-location-name">
              Location Name
              <span className="text-xs text-muted-foreground ml-2">Human-readable</span>
            </Label>
            <Input
              id="location-name"
              value={locationName}
              onChange={(e) => onLocationNameChange(e.target.value)}
              placeholder="Cox's Bazar, Chittagong, Bangladesh"
              data-testid="input-location-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" data-testid="label-subject">
              Subject / Category
              <span className="text-xs text-muted-foreground ml-2">Image type</span>
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="Landscape, Nature, Travel"
              data-testid="input-subject"
            />
          </div>
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
