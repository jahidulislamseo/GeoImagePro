import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MapLayer = "streets" | "satellite" | "terrain";

interface MapLayerSelectorProps {
  currentLayer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
}

export default function MapLayerSelector({
  currentLayer,
  onLayerChange,
}: MapLayerSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="gap-2"
          data-testid="button-map-layer-selector"
        >
          <Layers className="w-4 h-4" />
          Map Layer
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-testid="dropdown-map-layers">
        <DropdownMenuItem
          onClick={() => onLayerChange("streets")}
          data-testid="menu-item-streets"
          className={currentLayer === "streets" ? "bg-accent" : ""}
        >
          Street Map
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onLayerChange("satellite")}
          data-testid="menu-item-satellite"
          className={currentLayer === "satellite" ? "bg-accent" : ""}
        >
          Satellite View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onLayerChange("terrain")}
          data-testid="menu-item-terrain"
          className={currentLayer === "terrain" ? "bg-accent" : ""}
        >
          Terrain View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
