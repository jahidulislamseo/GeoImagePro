import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { LocationTemplate } from "@shared/schema";

interface LocationTemplateManagerProps {
  currentLat: number;
  currentLng: number;
  onSelectTemplate: (template: LocationTemplate) => void;
}

export default function LocationTemplateManager({
  currentLat,
  currentLng,
  onSelectTemplate,
}: LocationTemplateManagerProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const { data: templates = [] } = useQuery<LocationTemplate[]>({
    queryKey: ["/api/location-templates"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/location-templates", {
        name: templateName,
        latitude: currentLat,
        longitude: currentLng,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/location-templates"] });
      setTemplateName("");
      setOpen(false);
      toast({
        title: "Template saved",
        description: "Location template created successfully",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/location-templates/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/location-templates"] });
      toast({
        title: "Template deleted",
        description: "Location template removed",
      });
    },
  });

  return (
    <Card data-testid="card-location-templates">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Saved Locations</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-template">
              <Plus className="w-4 h-4 mr-1" />
              Save Current
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-add-template">
            <DialogHeader>
              <DialogTitle>Save Location Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Office, Home, Park"
                  data-testid="input-template-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Current Coordinates</Label>
                <p className="text-sm font-mono text-muted-foreground" data-testid="text-template-coords">
                  {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
                </p>
              </div>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!templateName.trim() || createMutation.isPending}
                className="w-full"
                data-testid="button-save-template"
              >
                Save Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-templates">
            No saved locations yet
          </p>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-2 rounded-md hover-elevate cursor-pointer"
                onClick={() => onSelectTemplate(template)}
                data-testid={`template-item-${template.id}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium" data-testid={`template-name-${template.id}`}>
                      {template.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono" data-testid={`template-coords-${template.id}`}>
                      {template.latitude.toFixed(4)}, {template.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(template.id);
                  }}
                  data-testid={`button-delete-${template.id}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
