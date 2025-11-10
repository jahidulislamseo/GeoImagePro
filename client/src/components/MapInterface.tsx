import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Minus, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MapInterfaceProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

type MapLayerType = 'streets' | 'satellite' | 'hybrid' | 'terrain';

export default function MapInterface({
  latitude = 40.7128,
  longitude = -74.006,
  onLocationChange,
}: MapInterfaceProps) {
  const [markerPos, setMarkerPos] = useState({ lat: latitude, lng: longitude });
  const [zoom, setZoom] = useState(13);
  const [mapLayer, setMapLayer] = useState<MapLayerType>('streets');

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const lat = latitude + (0.5 - y / rect.height) * 0.1;
    const lng = longitude + (x / rect.width - 0.5) * 0.1;
    
    setMarkerPos({ lat, lng });
    onLocationChange(lat, lng);
  };

  const getMapUrl = () => {
    const baseUrl = 'https://api.mapbox.com/styles/v1/mapbox';
    const token = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    const styleMap: Record<MapLayerType, string> = {
      streets: `${baseUrl}/streets-v12/static/${longitude},${latitude},${zoom},0/800x500@2x?access_token=${token}`,
      satellite: `${baseUrl}/satellite-v9/static/${longitude},${latitude},${zoom},0/800x500@2x?access_token=${token}`,
      hybrid: `${baseUrl}/satellite-streets-v12/static/${longitude},${latitude},${zoom},0/800x500@2x?access_token=${token}`,
      terrain: `${baseUrl}/outdoors-v12/static/${longitude},${latitude},${zoom},0/800x500@2x?access_token=${token}`,
    };
    
    return styleMap[mapLayer];
  };

  const layerLabels: Record<MapLayerType, string> = {
    streets: '🗺️ Streets',
    satellite: '🛰️ Satellite',
    hybrid: '🌍 Hybrid',
    terrain: '⛰️ Terrain',
  };

  return (
    <Card className="overflow-hidden" data-testid="card-map">
      <div className="relative h-[500px] bg-muted">
        <div
          className="w-full h-full cursor-crosshair relative"
          onClick={handleMapClick}
          data-testid="div-map-container"
          style={{
            backgroundImage: `url('${getMapUrl()}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            className="absolute transform -translate-x-1/2 -translate-y-full"
            style={{
              left: '50%',
              top: '50%',
            }}
            data-testid="icon-map-marker"
          >
            <MapPin className="w-8 h-8 text-destructive fill-destructive" />
          </div>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                data-testid="button-map-layers"
              >
                <Layers className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(layerLabels) as MapLayerType[]).map((layer) => (
                <DropdownMenuItem
                  key={layer}
                  onClick={() => setMapLayer(layer)}
                  className={mapLayer === layer ? 'bg-accent' : ''}
                  data-testid={`menu-item-${layer}`}
                >
                  {layerLabels[layer]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setZoom(Math.min(zoom + 1, 18))}
            data-testid="button-zoom-in"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setZoom(Math.max(zoom - 1, 1))}
            data-testid="button-zoom-out"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute bottom-4 left-4 bg-card px-3 py-2 rounded-md shadow-md">
          <p className="text-xs font-mono" data-testid="text-map-coordinates">
            {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
          </p>
        </div>
      </div>
    </Card>
  );
}
