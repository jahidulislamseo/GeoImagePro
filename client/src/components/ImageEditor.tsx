import { useState } from "react";
import { Crop, RotateCw, Maximize2, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

export default function ImageEditor({ imageUrl, onSave }: ImageEditorProps) {
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const handleSave = () => {
    // TODO: Implement actual image processing
    console.log("Saving edited image with filters:", {
      rotation,
      brightness,
      contrast,
      saturation,
    });
    onSave(imageUrl);
  };

  return (
    <Card data-testid="card-image-editor">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sliders className="w-4 h-4" />
          Image Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="relative w-full aspect-square bg-muted rounded-md overflow-hidden"
          data-testid="div-image-preview"
        >
          <img
            src={imageUrl}
            alt="Edit preview"
            className="w-full h-full object-contain"
            style={{
              transform: `rotate(${rotation}deg)`,
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
            }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRotate}
            data-testid="button-rotate"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Rotate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            data-testid="button-reset"
          >
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">
              Brightness: {brightness}%
            </Label>
            <Slider
              value={[brightness]}
              onValueChange={([value]) => setBrightness(value)}
              min={0}
              max={200}
              step={1}
              data-testid="slider-brightness"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">
              Contrast: {contrast}%
            </Label>
            <Slider
              value={[contrast]}
              onValueChange={([value]) => setContrast(value)}
              min={0}
              max={200}
              step={1}
              data-testid="slider-contrast"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">
              Saturation: {saturation}%
            </Label>
            <Slider
              value={[saturation]}
              onValueChange={([value]) => setSaturation(value)}
              min={0}
              max={200}
              step={1}
              data-testid="slider-saturation"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full"
          data-testid="button-save-edits"
        >
          Apply Changes
        </Button>
      </CardContent>
    </Card>
  );
}
