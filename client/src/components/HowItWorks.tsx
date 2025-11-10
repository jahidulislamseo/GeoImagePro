import { Card, CardContent } from "@/components/ui/card";
import { Upload, MapPin, FileText, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Images",
    description: "Drag and drop or select JPG, PNG, WebP, or HEIC photos",
  },
  {
    icon: MapPin,
    title: "Set Location",
    description: "Click on the map or enter coordinates manually",
  },
  {
    icon: FileText,
    title: "Add Metadata",
    description: "Optionally add keywords and descriptions for SEO",
  },
  {
    icon: Download,
    title: "Download",
    description: "Get your geotagged images with embedded EXIF data",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold text-center mb-12" data-testid="text-how-it-works-title">
          How to Geotag Photos
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="text-center" data-testid={`card-step-${index + 1}`}>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-xs font-semibold text-primary mb-2">
                    STEP {index + 1}
                  </div>
                  <h3 className="font-medium mb-2" data-testid={`text-step-title-${index + 1}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid={`text-step-desc-${index + 1}`}>
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
