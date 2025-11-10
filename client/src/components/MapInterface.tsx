import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Minus, Layers, Search, Maximize2, Minimize2, Navigation } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setMarkerPos({ lat: latitude, lng: longitude });
    setMapKey(prev => prev + 1);
  }, [latitude, longitude]);

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
    const width = 800;
    const height = 500;
    
    const styleMap: Record<MapLayerType, string> = {
      streets: `https://tile.openstreetmap.org/${zoom}/${getLngTile(longitude, zoom)}/${getLatTile(latitude, zoom)}.png`,
      satellite: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${getLatTile(latitude, zoom)}/${getLngTile(longitude, zoom)}`,
      hybrid: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${getLatTile(latitude, zoom)}/${getLngTile(longitude, zoom)}`,
      terrain: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${zoom}/${getLatTile(latitude, zoom)}/${getLngTile(longitude, zoom)}`,
    };
    
    return `https://api.mapbox.com/styles/v1/mapbox/${getMapboxStyle()}/static/${longitude},${latitude},${zoom},0/${width}x${height}@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
  };

  const getMapboxStyle = () => {
    const styles: Record<MapLayerType, string> = {
      streets: 'streets-v12',
      satellite: 'satellite-v9',
      hybrid: 'satellite-streets-v12',
      terrain: 'outdoors-v12',
    };
    return styles[mapLayer];
  };

  const getLngTile = (lng: number, zoom: number) => {
    return Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  };

  const getLatTile = (lat: number, zoom: number) => {
    return Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, zoom)
    );
  };

  const layerLabels: Record<MapLayerType, string> = {
    streets: '🗺️ Streets',
    satellite: '🛰️ Satellite',
    hybrid: '🌍 Hybrid',
    terrain: '⛰️ Terrain',
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        
        setMarkerPos({ lat: newLat, lng: newLng });
        onLocationChange(newLat, newLng);
        
        toast({
          title: "Location found",
          description: display_name,
        });
      } else {
        toast({
          title: "Location not found",
          description: "Please try a different search term",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to search location",
        variant: "destructive",
      });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        
        setMarkerPos({ lat: newLat, lng: newLng });
        onLocationChange(newLat, newLng);
        
        toast({
          title: "Current location detected",
          description: `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`,
        });
      },
      (error) => {
        toast({
          title: "Location access denied",
          description: "Please enable location permissions",
          variant: "destructive",
        });
      }
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={`overflow-hidden transition-all ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`} data-testid="card-map">
      <div className={`relative bg-muted ${isFullscreen ? 'h-screen' : 'h-[500px]'}`}>
        {/* Search Bar */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 bg-card/95 backdrop-blur-sm p-2 rounded-lg shadow-lg">
          <Input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-64"
            data-testid="input-search-location"
          />
          <Button
            size="icon"
            variant="secondary"
            onClick={handleSearch}
            data-testid="button-search"
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={getCurrentLocation}
            data-testid="button-current-location"
            title="Get current location"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        <div
          key={mapKey}
          className="w-full h-full cursor-crosshair relative"
          onClick={handleMapClick}
          data-testid="div-map-container"
          style={{
            backgroundImage: `url('${getMapUrl()}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
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

        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                data-testid="button-map-layers"
                title="Map layers"
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
            onClick={toggleFullscreen}
            data-testid="button-fullscreen"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setZoom(Math.min(zoom + 1, 18))}
            data-testid="button-zoom-in"
            title="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setZoom(Math.max(zoom - 1, 1))}
            data-testid="button-zoom-out"
            title="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm px-3 py-2 rounded-md shadow-md z-10">
          <p className="text-xs font-mono" data-testid="text-map-coordinates">
            📍 {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            🔍 Zoom: {zoom}x • {layerLabels[mapLayer]}
          </p>
        </div>
      </div>
    </Card>
  );
}
