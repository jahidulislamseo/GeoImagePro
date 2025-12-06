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

  const analyzeImageMutation = useMutation({
    mutationFn: async () => {
      if (!imageFile) throw new Error("No image file");

      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("AI analysis failed");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.latitude && data.longitude && onLocationDetected) {
        onLocationDetected(data.latitude, data.longitude);
      }
      if (data.keywords && onKeywordsSuggested) {
        onKeywordsSuggested(data.keywords);
      }
      if (data.description && onDescriptionGenerated) {
        onDescriptionGenerated(data.description);
      }

      toast({
        title: "Analysis Complete",
        description: `AI analyzed the image successfully${data.confidence ? ` (${(data.confidence * 100).toFixed(0)}% confidence)` : ''}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze image. Please try again.",
        variant: "destructive",
      });
    },
  });



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
            variant="default"
            onClick={() => analyzeImageMutation.mutate()}
            disabled={!imageFile || analyzeImageMutation.isPending}
            className="w-full justify-start bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            data-testid="button-ai-analyze"
          >
            {analyzeImageMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Smart Analyze Image (All-in-One)
          </Button>

          <p className="text-xs text-muted-foreground mt-2">
            Detects location, generates tags, and writes a description in one click.
          </p>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          💡 Tip: AI analysis works best with images containing recognizable landmarks or clear subjects.
        </p>
      </CardContent>
    </Card>
  );
}
