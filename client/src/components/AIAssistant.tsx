import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AIAssistantProps {
  imageFile?: File;
  onLocationDetected?: (lat: number, lng: number) => void;
  onKeywordsSuggested?: (keywords: string) => void;
  onDescriptionGenerated?: (description: string) => void;
}

export default function AIAssistant({
  imageFile,
  onLocationDetected,
  onKeywordsSuggested,
  onDescriptionGenerated,
}: AIAssistantProps) {
  const { toast } = useToast();

  const detectLocationMutation = useMutation({
    mutationFn: async () => {
      // TODO: Implement AI location detection with Python microservice
      // Mock response for now
      return {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
        longitude: -74.006 + (Math.random() - 0.5) * 0.01,
        confidence: 0.85,
      };
    },
    onSuccess: (data) => {
      if (onLocationDetected) {
        onLocationDetected(data.latitude, data.longitude);
      }
      toast({
        title: "Location detected",
        description: `AI detected location with ${(data.confidence * 100).toFixed(0)}% confidence`,
      });
    },
  });

  const suggestKeywordsMutation = useMutation({
    mutationFn: async () => {
      // TODO: Implement AI keyword generation
      return {
        keywords: "landscape, nature, mountain, sunset, scenic, outdoor, photography",
      };
    },
    onSuccess: (data) => {
      if (onKeywordsSuggested) {
        onKeywordsSuggested(data.keywords);
      }
      toast({
        title: "Keywords generated",
        description: "AI suggested relevant keywords",
      });
    },
  });

  const generateDescriptionMutation = useMutation({
    mutationFn: async () => {
      // TODO: Implement AI description generation
      return {
        description: "A stunning landscape photograph featuring majestic mountains during golden hour, with warm sunlight creating beautiful natural lighting across the scene.",
      };
    },
    onSuccess: (data) => {
      if (onDescriptionGenerated) {
        onDescriptionGenerated(data.description);
      }
      toast({
        title: "Description generated",
        description: "AI created a detailed description",
      });
    },
  });

  const isProcessing =
    detectLocationMutation.isPending ||
    suggestKeywordsMutation.isPending ||
    generateDescriptionMutation.isPending;

  return (
    <Card data-testid="card-ai-assistant">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Use AI to analyze your image and automatically generate metadata
        </p>
        
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => detectLocationMutation.mutate()}
            disabled={!imageFile || isProcessing}
            className="w-full justify-start"
            data-testid="button-ai-detect-location"
          >
            {detectLocationMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Detect Location from Image
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => suggestKeywordsMutation.mutate()}
            disabled={!imageFile || isProcessing}
            className="w-full justify-start"
            data-testid="button-ai-suggest-keywords"
          >
            {suggestKeywordsMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate Smart Keywords
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => generateDescriptionMutation.mutate()}
            disabled={!imageFile || isProcessing}
            className="w-full justify-start"
            data-testid="button-ai-generate-description"
          >
            {generateDescriptionMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate Description
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Note: AI features are currently in development mode
        </p>
      </CardContent>
    </Card>
  );
}
