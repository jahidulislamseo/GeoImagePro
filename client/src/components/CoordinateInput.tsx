import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CoordinateInputProps {
  latitude: number;
  longitude: number;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
}

export default function CoordinateInput({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
}: CoordinateInputProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="latitude" data-testid="label-latitude">
          Latitude
        </Label>
        <Input
          id="latitude"
          type="number"
          step="any"
          value={latitude}
          onChange={(e) => onLatitudeChange(parseFloat(e.target.value) || 0)}
          className="font-mono"
          placeholder="40.712800"
          data-testid="input-latitude"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="longitude" data-testid="label-longitude">
          Longitude
        </Label>
        <Input
          id="longitude"
          type="number"
          step="any"
          value={longitude}
          onChange={(e) => onLongitudeChange(parseFloat(e.target.value) || 0)}
          className="font-mono"
          placeholder="-74.006000"
          data-testid="input-longitude"
        />
      </div>
    </div>
  );
}
