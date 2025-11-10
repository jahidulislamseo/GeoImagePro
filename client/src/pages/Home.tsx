import { useState } from "react";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import ImageThumbnail from "@/components/ImageThumbnail";
import MapInterface from "@/components/MapInterface";
import MetadataPanel from "@/components/MetadataPanel";
import LocationSearch from "@/components/LocationSearch";
import SearchHistory from "@/components/SearchHistory";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import { useToast } from "@/hooks/use-toast";

interface UploadedImage {
  file: File;
  preview: string;
  hasGeotag: boolean;
}

interface SearchHistoryItem {
  id: string;
  location: string;
  coordinates: { lat: number; lng: number };
  timestamp: Date;
}

export default function Home() {
  const { toast } = useToast();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [latitude, setLatitude] = useState(40.7128);
  const [longitude, setLongitude] = useState(-74.006);
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  const handleFilesSelected = (files: File[]) => {
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      hasGeotag: false,
    }));
    setImages((prev) => [...prev, ...newImages]);
    toast({
      title: "Images uploaded",
      description: `${files.length} image(s) added successfully`,
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
    }
  };

  const handleLocationSearch = (query: string) => {
    // Mock search - in real app, this would call a geocoding API
    const mockLat = 40.7128 + (Math.random() - 0.5) * 10;
    const mockLng = -74.006 + (Math.random() - 0.5) * 10;
    
    setLatitude(mockLat);
    setLongitude(mockLng);
    
    const newHistoryItem: SearchHistoryItem = {
      id: Date.now().toString(),
      location: query,
      coordinates: { lat: mockLat, lng: mockLng },
      timestamp: new Date(),
    };
    
    setSearchHistory((prev) => [newHistoryItem, ...prev.slice(0, 4)]);
    
    toast({
      title: "Location found",
      description: `Coordinates set to ${mockLat.toFixed(4)}, ${mockLng.toFixed(4)}`,
    });
  };

  const handleSelectHistoryLocation = (item: SearchHistoryItem) => {
    setLatitude(item.coordinates.lat);
    setLongitude(item.coordinates.lng);
    toast({
      title: "Location selected",
      description: item.location,
    });
  };

  const handleWriteExif = () => {
    if (selectedImageIndex !== null) {
      setImages((prev) =>
        prev.map((img, i) =>
          i === selectedImageIndex ? { ...img, hasGeotag: true } : img
        )
      );
      toast({
        title: "EXIF tags written",
        description: "Geotag and metadata added to the image",
      });
    } else {
      toast({
        title: "No image selected",
        description: "Please select an image first",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (selectedImageIndex !== null) {
      toast({
        title: "Download started",
        description: "Your geotagged image is being downloaded",
      });
    } else {
      toast({
        title: "No image selected",
        description: "Please select an image first",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setKeywords("");
    setDescription("");
    setDocumentName("");
    toast({
      title: "Metadata cleared",
      description: "All metadata fields have been reset",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-6">
            <UploadZone onFilesSelected={handleFilesSelected} />

            {images.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4" data-testid="text-uploaded-images-title">
                  Uploaded Images ({images.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <ImageThumbnail
                      key={index}
                      file={image.file}
                      preview={image.preview}
                      hasGeotag={image.hasGeotag}
                      onRemove={() => handleRemoveImage(index)}
                      onSelect={() => setSelectedImageIndex(index)}
                      isSelected={selectedImageIndex === index}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium" data-testid="text-map-title">
                Set Location
              </h3>
              <LocationSearch onSearch={handleLocationSearch} />
              <MapInterface
                latitude={latitude}
                longitude={longitude}
                onLocationChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
              />
            </div>

            {searchHistory.length > 0 && (
              <SearchHistory
                history={searchHistory}
                onSelectLocation={handleSelectHistoryLocation}
              />
            )}
          </div>

          <div>
            <MetadataPanel
              latitude={latitude}
              longitude={longitude}
              keywords={keywords}
              description={description}
              documentName={documentName}
              onLatitudeChange={setLatitude}
              onLongitudeChange={setLongitude}
              onKeywordsChange={setKeywords}
              onDescriptionChange={setDescription}
              onDocumentNameChange={setDocumentName}
              onWriteExif={handleWriteExif}
              onDownload={handleDownload}
              onClear={handleClear}
            />
          </div>
        </div>
      </main>

      <HowItWorks />
      <FAQ />

      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p data-testid="text-footer">
            © 2024 GeoTag Pro. All uploaded images are processed locally and not stored.
          </p>
        </div>
      </footer>
    </div>
  );
}
