import { MapPin } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" data-testid="icon-logo" />
          <h1 className="text-xl font-semibold" data-testid="text-app-title">
            GeoTag Pro
          </h1>
        </div>
        <nav className="flex items-center gap-4">
          <a href="#how-it-works" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-how-it-works">
            How It Works
          </a>
          <a href="#faq" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-faq">
            FAQ
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
