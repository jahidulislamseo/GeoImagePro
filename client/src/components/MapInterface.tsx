import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Plus, Minus, Layers, Search, Maximize2, Minimize2, Navigation } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import mapPlaceholderImage from "@assets/stock_images/world_map_atlas_glob_34150d91.jpg";

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
  const [textSearchQuery, setTextSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapUrl, setMapUrl] = useState('');
  const [searchType, setSearchType] = useState<'place' | 'text'>('place');
  const { toast } = useToast();

  useEffect(() => {
    setMarkerPos({ lat: latitude, lng: longitude });
  }, [latitude, longitude]);

  useEffect(() => {
    const width = 800;
    const height = 500;
    
    const getStaticMapUrl = () => {
      // Using different providers for each layer
      if (mapLayer === 'streets') {
        // OpenStreetMap static image via staticmap.openstreetmap.de
        return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&maptype=mapnik`;
      } else if (mapLayer === 'satellite') {
        // ESRI World Imagery
        const z = zoom;
        const x = Math.floor((longitude + 180) / 360 * Math.pow(2, z));
        const y = Math.floor((1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
        return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
      } else if (mapLayer === 'hybrid') {
        // ESRI World Imagery with labels
        const z = zoom;
        const x = Math.floor((longitude + 180) / 360 * Math.pow(2, z));
        const y = Math.floor((1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
        return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
      } else {
        // Terrain - OpenTopoMap
        return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&maptype=mapnik`;
      }
    };
    
    const url = getStaticMapUrl();
    setMapUrl(url);
  }, [latitude, longitude, zoom, mapLayer]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const lat = latitude + (0.5 - y / rect.height) * 0.1;
    const lng = longitude + (x / rect.width - 0.5) * 0.1;
    
    setMarkerPos({ lat, lng });
    onLocationChange(lat, lng);
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
        
        setMarkerPos({ lat: newLat, lng: newLng });
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
        {/* Map/Satellite Toggle & Search Bar */}
        <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <Tabs value={mapLayer === 'streets' ? 'map' : 'satellite'} onValueChange={(v) => setMapLayer(v === 'map' ? 'streets' : 'satellite')} className="w-full">
            <div className="flex border-b">
              <TabsList className="bg-transparent border-0 rounded-none h-10">
                <TabsTrigger 
                  value="map" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none px-6"
                  data-testid="tab-map"
                >
                  Map
                </TabsTrigger>
                <TabsTrigger 
                  value="satellite" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none px-6"
                  data-testid="tab-satellite"
                >
                  Satellite
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Search Tabs */}
            <div className="p-2">
              <Tabs value={searchType} onValueChange={(v) => setSearchType(v as 'place' | 'text')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-2">
                  <TabsTrigger value="place" data-testid="tab-place-search">Place Search</TabsTrigger>
                  <TabsTrigger value="text" data-testid="tab-text-search">Text Search</TabsTrigger>
                </TabsList>
                
                <TabsContent value="place" className="mt-0">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Search for a place or address"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePlaceSearch()}
                      className="w-80"
                      data-testid="input-place-search"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={handlePlaceSearch}
                      data-testid="button-place-search"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="text" className="mt-0">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter address or coordinates"
                      value={textSearchQuery}
                      onChange={(e) => setTextSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
                      className="w-80"
                      data-testid="input-text-search"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={handleTextSearch}
                      data-testid="button-text-search"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button
                size="sm"
                variant="outline"
                onClick={getCurrentLocation}
                data-testid="button-current-location"
                className="w-full mt-2"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Current Location
              </Button>
            </div>
          </Tabs>
        </div>

        <div
          className="w-full h-full cursor-crosshair relative overflow-hidden"
          onClick={handleMapClick}
          data-testid="div-map-container"
        >
          {mapUrl && (
            <img
              src={mapUrl}
              alt="Map"
              className="w-full h-full object-cover"
              data-testid="img-map"
            />
          )}
          {!mapUrl && (
            <div className="w-full h-full relative overflow-hidden">
              <img 
                src={mapPlaceholderImage} 
                alt="World Map" 
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-background/60 to-background/80 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center space-y-4 p-8">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Interactive Map</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Use the search above to find a location or enter coordinates manually.<br/>
                      Click on the map to place a marker.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-full"
            style={{
              left: '50%',
              top: '50%',
            }}
            data-testid="icon-map-marker"
          >
            <MapPin className="w-8 h-8 text-destructive fill-destructive drop-shadow-lg" />
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
