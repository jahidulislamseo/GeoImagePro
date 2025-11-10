import { useState } from "react";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import ImageThumbnail from "@/components/ImageThumbnail";
import MapInterface from "@/components/MapInterface";
import MetadataPanel from "@/components/MetadataPanel";
import LocationSearch from "@/components/LocationSearch";
import SearchHistory from "@/components/SearchHistory";
import LocationTemplateManager from "@/components/LocationTemplateManager";
import BatchControls from "@/components/BatchControls";
import AdvancedExifEditor from "@/components/AdvancedExifEditor";
import MapLayerSelector from "@/components/MapLayerSelector";
import AIAssistant from "@/components/AIAssistant";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { LocationTemplate } from "@shared/schema";

interface UploadedImage {
  file: File;
  preview: string;
  hasGeotag: boolean;
  isSelected: boolean;
}

interface SearchHistoryItem {
  id: string;
  location: string;
  coordinates: { lat: number; lng: number };
  timestamp: Date;
}

type MapLayer = "streets" | "satellite" | "terrain";

export default function Home() {
  const { toast } = useToast();
  
  // Image state
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  // Location state
  const [latitude, setLatitude] = useState(40.7128);
  const [longitude, setLongitude] = useState(-74.006);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [mapLayer, setMapLayer] = useState<MapLayer>("streets");
  
  // Metadata state
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [documentName, setDocumentName] = useState("");
  
  // SEO metadata state (initialized with empty strings for controlled inputs)
  const [imageTitle, setImageTitle] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  
  // Advanced EXIF state
  const [copyright, setCopyright] = useState("");
  const [artist, setArtist] = useState("");
  const [cameraModel, setCameraModel] = useState("");
  const [cameraMake, setCameraMake] = useState("");

  // Handlers
  const handleFilesSelected = (files: File[]) => {
    const newImages = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      hasGeotag: false,
      // Auto-select and highlight the first image if none is currently selected
      isSelected: selectedImageIndex === null && images.length === 0 && index === 0,
    }));
    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    
    // Auto-select the first image if none is selected
    if (selectedImageIndex === null && updatedImages.length > 0) {
      setSelectedImageIndex(0);
    }
    
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

  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isSelected: i === index,
      }))
    );
  };

  const handleSelectAll = () => {
    setImages((prev) => prev.map((img) => ({ ...img, isSelected: true })));
  };

  const handleDeselectAll = () => {
    setImages((prev) => prev.map((img) => ({ ...img, isSelected: false })));
  };

  const handleApplyToSelected = () => {
    const selectedCount = images.filter((img) => img.isSelected).length;
    setImages((prev) =>
      prev.map((img) =>
        img.isSelected ? { ...img, hasGeotag: true } : img
      )
    );
    toast({
      title: "Batch processing complete",
      description: `Applied geotag to ${selectedCount} image(s)`,
    });
  };

  const handleLocationSearch = (query: string) => {
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

  const handleSelectTemplate = (template: LocationTemplate) => {
    setLatitude(template.latitude);
    setLongitude(template.longitude);
    toast({
      title: "Template applied",
      description: template.name,
    });
  };

  const handleWriteExif = async () => {
    if (selectedImageIndex === null) {
      toast({
        title: "No image selected",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    const image = images[selectedImageIndex];
    
    try {
      // Create FormData to send image and metadata
      const formData = new FormData();
      formData.append('image', image.file);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('keywords', keywords);
      formData.append('description', description);
      formData.append('documentName', documentName);
      formData.append('imageTitle', imageTitle);
      formData.append('caption', caption);
      formData.append('locationName', locationName);
      formData.append('subject', subject);
      formData.append('copyright', copyright);
      formData.append('artist', artist);

      toast({
        title: "Processing...",
        description: "Adding EXIF tags to your image",
      });

      // Call backend API to process image
      const response = await fetch('/api/images/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      // Get the processed image blob
      const blob = await response.blob();
      
      // Update the image in state with geotagged flag
      setImages((prev) =>
        prev.map((img, i) =>
          i === selectedImageIndex ? { ...img, hasGeotag: true } : img
        )
      );

      // Auto-download the geotagged image
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `geotagged_${image.file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "EXIF tags written and image downloaded",
      });
    } catch (error) {
      console.error('EXIF write error:', error);
      toast({
        title: "Failed to write EXIF tags",
        description: "An error occurred while processing the image",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (selectedImageIndex === null) {
      toast({
        title: "No image selected",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    const image = images[selectedImageIndex];
    
    try {
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = image.preview;
      link.download = image.file.name.replace(/\.[^/.]+$/, '_geotagged$&');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: `${image.file.name} is being downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download the image",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setKeywords("");
    setDescription("");
    setDocumentName("");
    setCopyright("");
    setArtist("");
    setCameraModel("");
    setCameraMake("");
    toast({
      title: "Metadata cleared",
      description: "All metadata fields have been reset",
    });
  };

  const selectedImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;
  const selectedCount = images.filter((img) => img.isSelected).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-6">
            <UploadZone onFilesSelected={handleFilesSelected} />

            {images.length > 0 && (
              <>
                <BatchControls
                  totalImages={images.length}
                  selectedCount={selectedCount}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onApplyToSelected={handleApplyToSelected}
                />

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
                        onSelect={() => handleSelectImage(index)}
                        isSelected={image.isSelected}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium" data-testid="text-map-title">
                  Set Location
                </h3>
                <MapLayerSelector
                  currentLayer={mapLayer}
                  onLayerChange={setMapLayer}
                />
              </div>
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

            <LocationTemplateManager
              currentLat={latitude}
              currentLng={longitude}
              onSelectTemplate={handleSelectTemplate}
            />

            {searchHistory.length > 0 && (
              <SearchHistory
                history={searchHistory}
                onSelectLocation={handleSelectHistoryLocation}
              />
            )}
          </div>

          <div className="space-y-6">
            {selectedImage ? (
              <>
                <AIAssistant
                  imageFile={selectedImage?.file}
                  onLocationDetected={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                  onKeywordsSuggested={setKeywords}
                  onDescriptionGenerated={setDescription}
                />

                <MetadataPanel
                  latitude={latitude}
                  longitude={longitude}
                  keywords={keywords}
                  description={description}
                  documentName={documentName}
                  imageTitle={imageTitle}
                  caption={caption}
                  locationName={locationName}
                  subject={subject}
                  onLatitudeChange={setLatitude}
                  onLongitudeChange={setLongitude}
                  onKeywordsChange={setKeywords}
                  onDescriptionChange={setDescription}
                  onDocumentNameChange={setDocumentName}
                  onImageTitleChange={setImageTitle}
                  onCaptionChange={setCaption}
                  onLocationNameChange={setLocationName}
                  onSubjectChange={setSubject}
                  onWriteExif={handleWriteExif}
                  onDownload={handleDownload}
                  onClear={handleClear}
                />

                <AdvancedExifEditor
                  copyright={copyright}
                  artist={artist}
                  cameraModel={cameraModel}
                  cameraMake={cameraMake}
                  onCopyrightChange={setCopyright}
                  onArtistChange={setArtist}
                  onCameraModelChange={setCameraModel}
                  onCameraMakeChange={setCameraMake}
                />
              </>
            ) : (
              <Card className="p-8 text-center bg-muted/30" data-testid="card-upload-reminder">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Upload an Image to Start</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop a photo above or click to browse.<br />
                      Metadata editing options will appear here once you upload an image.
                    </p>
                  </div>
                </div>
              </Card>
            )}
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
