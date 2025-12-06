import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Search, Maximize2, Minimize2, Navigation } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapInterfaceProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  onFileDrop?: (file: File, lat: number, lng: number) => void;
}

type MapLayerType = 'streets' | 'satellite' | 'hybrid' | 'terrain';

function LocationMarker({ position, onLocationChange }: { position: L.LatLngExpression, onLocationChange: (lat: number, lng: number) => void }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function DropZone({ onFileDrop }: { onFileDrop?: (file: File, lat: number, lng: number) => void }) {
  const map = useMap();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!onFileDrop) return;

    const container = map.getContainer();

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!file.type.startsWith('image/')) return;

      // Get the coordinates where the file was dropped
      const point = map.mouseEventToLatLng(e as any);
      onFileDrop(file, point.lat, point.lng);
    };

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('drop', handleDrop);

    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('dragleave', handleDragLeave);
      container.removeEventListener('drop', handleDrop);
    };
  }, [map, onFileDrop]);

  return isDragging ? (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      border: '3px dashed rgb(59, 130, 246)',
      zIndex: 1000,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'rgb(59, 130, 246)'
    }}>
      Drop image here to set location
    </div>
  ) : null;
}

export default function MapInterface({
  latitude = 40.7128,
  longitude = -74.006,
  onLocationChange,
  onFileDrop
}: MapInterfaceProps) {
  const [zoom, setZoom] = useState(13);
  const [mapLayer, setMapLayer] = useState<MapLayerType>('streets');
  const [searchQuery, setSearchQuery] = useState('');
  const [textSearchQuery, setTextSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchType, setSearchType] = useState<'place' | 'text'>('place');
  const { toast } = useToast();

  const layerUrls: Record<MapLayerType, string> = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    hybrid: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', // Simplified for now, real hybrid needs overlay
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  };

  const layerAttributions: Record<MapLayerType, string> = {
    streets: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    hybrid: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    terrain: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  };

  const layerLabels: Record<MapLayerType, string> = {
    streets: '🗺️ Streets',
    satellite: '🛰️ Satellite',
    hybrid: '🌍 Hybrid',
    terrain: '⛰️ Terrain',
  };

  const handlePlaceSearch = async () => {
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

  const handleTextSearch = async () => {
    if (!textSearchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textSearchQuery)}`
      );
      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);

        onLocationChange(newLat, newLng);

        toast({
          title: "Location found",
          description: display_name,
        });
      } else {
        toast({
          title: "No results found",
          description: "Please try different keywords",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to perform text search",
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

        onLocationChange(newLat, newLng);
        setZoom(15);

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

        <div className="absolute top-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden max-w-[90%] sm:max-w-md">
          <Tabs value="controls" className="w-full">
            <div className="p-2 space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search place..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePlaceSearch()}
                  className="w-full h-8 text-sm"
                />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handlePlaceSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="flex-1 h-8 text-xs"
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  Locate Me
                </Button>
              </div>
            </div>
          </Tabs>
        </div>

        <div className="w-full h-full z-0">
          <MapContainer
            center={[latitude, longitude]}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false} // We will add custom zoom controls if needed, or use default
          >
            <TileLayer
              attribution={layerAttributions[mapLayer]}
              url={layerUrls[mapLayer]}
            />
            <LocationMarker position={[latitude, longitude]} onLocationChange={onLocationChange} />
            <MapUpdater center={[latitude, longitude]} zoom={zoom} />
            <DropZone onFileDrop={onFileDrop} />
          </MapContainer>
        </div>


        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                data-testid="button-map-layers"
                title="Map layers"
                className="bg-white/90 hover:bg-white shadow-md"
              >
                <Layers className="w-4 h-4 text-black" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(layerLabels) as MapLayerType[]).map((layer) => (
                <DropdownMenuItem
                  key={layer}
                  onClick={() => setMapLayer(layer)}
                  className={mapLayer === layer ? 'bg-accent' : ''}
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
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="bg-white/90 hover:bg-white shadow-md"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-black" /> : <Maximize2 className="w-4 h-4 text-black" />}
          </Button>
        </div>

        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-md z-[1000] text-card-foreground">
          <p className="text-xs font-mono">
            📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>
      </div>
    </Card>
  );
}
