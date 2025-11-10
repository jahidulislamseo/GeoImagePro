# Design Guidelines: Advanced Photo Geotagging Application

## Design Approach

**Selected Framework:** Design System Approach (Material Design + Linear influences)
- **Rationale:** Utility-focused application requiring clear information hierarchy, efficient workflows, and data-dense interfaces
- **Key Principles:** Clarity, efficiency, professional polish, and intuitive spatial organization

## Core Design Elements

### Typography
- **Primary Font:** Inter (Google Fonts) - exceptional legibility for UI and data
- **Hierarchy:**
  - H1 (Page Title): 2xl, semibold (600)
  - H2 (Section Headers): xl, semibold (600)
  - H3 (Subsections): lg, medium (500)
  - Body Text: base, regular (400)
  - Labels/Captions: sm, medium (500)
  - Metadata/Coordinates: mono font for precision data (JetBrains Mono)

### Layout System
- **Container:** max-w-7xl with px-4 (mobile) to px-8 (desktop)
- **Spacing Scale:** Tailwind units of 2, 4, 6, 8, 12, 16, 24
  - Component padding: p-4 to p-6
  - Section spacing: gap-6 to gap-8
  - Margins between major sections: mb-8 to mb-12
- **Grid System:** 
  - Main layout: 2-column (60/40 split) on desktop - Left: Upload/Map, Right: Metadata panel
  - Mobile: Single column stack
  - Image grid: 4 columns (desktop), 2 columns (tablet), 1 column (mobile)

### Component Library

#### Navigation
- Clean header with logo, navigation links, and account/pro badge
- Minimal navigation: "Home", "How It Works", "Pricing", "Sign In"
- Sticky header with subtle shadow on scroll

#### Upload Zone
- Large drag-and-drop area with dashed border and upload icon
- Multiple file format badges (JPG, PNG, WebP, HEIC)
- File upload button as secondary action
- Thumbnail grid below with individual image cards showing preview, filename, and remove option

#### Map Interface
- Full-width embedded map (600px height minimum)
- Map controls overlay: Search bar (top), zoom controls (right), map type toggle
- Draggable marker with tooltip showing coordinates
- Clean, modern map styling (avoid default Google Maps appearance)

#### Metadata Panel
- Card-based design with clear sections:
  - "Existing Geotags" (collapsible)
  - "New Geotags" with lat/lon inputs
  - "Keywords and Tags" textarea
  - "Description" textarea
- Input fields: Consistent height (h-10), rounded corners, clear labels above inputs
- Character counters for text areas

#### Action Buttons
- Primary: "Write EXIF Tags" - prominent, full-width in metadata panel
- Secondary: "Download", "Clear" - side-by-side below primary
- Button hierarchy: Solid primary, outlined secondary

#### Data Display
- Coordinate display: Monospace font in rounded badge/pill components
- EXIF metadata: Key-value pairs in table or definition list format
- Search history: List with timestamps and quick-select functionality

#### Form Controls
- Text inputs: Clean, minimal borders, focus states with subtle outline
- Textareas: Auto-expanding or fixed height with scroll
- Toggles/switches for show/hide functionality
- Dropdown for map type selection

### Responsive Behavior
- **Desktop (lg+):** Side-by-side layout with fixed map on left, scrollable metadata on right
- **Tablet (md):** Stacked sections with map above metadata
- **Mobile:** Full-width components, simplified navigation (hamburger menu)

### Animations
- Minimal and purposeful only:
  - Smooth transitions on button hover (150ms)
  - Fade-in for uploaded image thumbnails
  - Map marker drop animation on placement
  - No excessive animations - focus on performance

### Images
**No hero image required.** This is a utility application. Focus on:
- Placeholder graphics in upload zone (cloud/upload icon)
- Map thumbnails for location visualization
- User-uploaded photo previews

### Information Architecture
**Primary Workflow Sections:**
1. Upload Area (prominent, top-left)
2. Map Interface (central, interactive)
3. Metadata Panel (right sidebar or below on mobile)
4. Action Controls (bottom of metadata panel)
5. FAQ/How-to (collapsible accordion below main interface)

**Visual Hierarchy:** Upload → Map → Metadata → Actions (clear vertical flow on mobile, spatial organization on desktop)

### Polish & Details
- Subtle shadows for elevation (cards, modals)
- Consistent border-radius: rounded-lg for cards, rounded-md for inputs
- Focus states: Clear outline for keyboard navigation
- Loading states: Skeleton screens or spinners for async operations
- Error states: Inline validation messages with warning icons
- Success feedback: Toast notifications for completed actions