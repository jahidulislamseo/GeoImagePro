import { Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SearchHistoryItem {
  id: string;
  location: string;
  coordinates: { lat: number; lng: number };
  timestamp: Date;
}

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelectLocation: (item: SearchHistoryItem) => void;
}

export default function SearchHistory({ history, onSelectLocation }: SearchHistoryProps) {
  if (history.length === 0) {
    return (
      <Card data-testid="card-search-history-empty">
        <CardContent className="py-8 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground" data-testid="text-no-history">
            No search history yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-search-history">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Locations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {history.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className="w-full justify-start hover-elevate"
            onClick={() => onSelectLocation(item)}
            data-testid={`button-history-${item.id}`}
          >
            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium" data-testid={`text-location-${item.id}`}>
                {item.location}
              </p>
              <p className="text-xs text-muted-foreground font-mono" data-testid={`text-coords-${item.id}`}>
                {item.coordinates.lat.toFixed(4)}, {item.coordinates.lng.toFixed(4)}
              </p>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
