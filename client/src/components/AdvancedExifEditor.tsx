import { useState } from "react";
import { Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface AdvancedExifEditorProps {
  copyright: string;
  artist: string;
  cameraModel: string;
  cameraMake: string;
  onCopyrightChange: (value: string) => void;
  onArtistChange: (value: string) => void;
  onCameraModelChange: (value: string) => void;
  onCameraMakeChange: (value: string) => void;
}

export default function AdvancedExifEditor({
  copyright,
  artist,
  cameraModel,
  cameraMake,
  onCopyrightChange,
  onArtistChange,
  onCameraModelChange,
  onCameraMakeChange,
}: AdvancedExifEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card data-testid="card-advanced-exif">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 hover:bg-transparent"
              data-testid="button-toggle-advanced-exif"
            >
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced EXIF Fields
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {isOpen ? "Hide" : "Show"}
              </span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="copyright" data-testid="label-copyright">
                  Copyright
                </Label>
                <Input
                  id="copyright"
                  value={copyright}
                  onChange={(e) => onCopyrightChange(e.target.value)}
                  placeholder="© 2024 Your Name"
                  data-testid="input-copyright"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist" data-testid="label-artist">
                  Artist/Creator
                </Label>
                <Input
                  id="artist"
                  value={artist}
                  onChange={(e) => onArtistChange(e.target.value)}
                  placeholder="John Doe"
                  data-testid="input-artist"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="camera-make" data-testid="label-camera-make">
                  Camera Make
                </Label>
                <Input
                  id="camera-make"
                  value={cameraMake}
                  onChange={(e) => onCameraMakeChange(e.target.value)}
                  placeholder="Canon"
                  data-testid="input-camera-make"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camera-model" data-testid="label-camera-model">
                  Camera Model
                </Label>
                <Input
                  id="camera-model"
                  value={cameraModel}
                  onChange={(e) => onCameraModelChange(e.target.value)}
                  placeholder="EOS R5"
                  data-testid="input-camera-model"
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
