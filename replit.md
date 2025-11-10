# GeoTag Pro - Advanced Photo Geotagging Application

## Overview
GeoTag Pro is a comprehensive web application for adding geotags and metadata to photos. It supports JPG, PNG, WebP, and HEIC formats, offering both basic and advanced features for professional image management.

## Recent Updates (November 2024)

### Phase 1 Features - Completed
1. **Database Schema & Storage**
   - PostgreSQL database integration
   - Location templates storage
   - Batch job tracking
   - AI job management
   - In-memory storage implementation with full CRUD operations

2. **Dark Mode**
   - Theme toggle with light/dark modes
   - Persistent theme selection via localStorage
   - Smooth theme transitions across all components

3. **Batch Processing**
   - Select multiple images simultaneously
   - Apply geotags to all selected images at once
   - Visual batch selection UI with select/deselect all
   - Batch progress tracking

4. **Location Templates**
   - Save frequently used locations
   - Quick access to saved locations
   - Template management (create, view, delete)
   - One-click location application

5. **Advanced EXIF Metadata**
   - Extended EXIF fields editor (collapsible)
   - Copyright information
   - Artist/Creator name
   - Camera make and model
   - Document name and descriptions
   - Keywords with character counter (max 6,600 chars)
   - Image descriptions (max 1,300 chars)

6. **Server-Side Image Processing**
   - Express API routes for all operations
   - Multer file upload handling
   - Sharp image processing integration
   - ZIP archive generation for batch downloads
   - EXIF writing infrastructure (piexifjs ready)

7. **Enhanced Map Interface**
   - Multiple map layer options (Streets, Satellite, Terrain)
   - Interactive marker placement
   - Zoom controls
   - Real-time coordinate display
   - Click-to-place geotag functionality

8. **Image Editor**
   - Rotation (90° increments)
   - Brightness adjustment (0-200%)
   - Contrast adjustment (0-200%)
   - Saturation adjustment (0-200%)
   - Real-time preview
   - Reset functionality

9. **AI Assistant UI**
   - AI-powered location detection (UI ready)
   - Smart keyword generation interface
   - Auto-description generation interface
   - Progress indicators for AI operations
   - Error handling and feedback

### Phase 2 Features - In Development
10. **Python FastAPI Microservice**
    - Planned for AI image analysis
    - Will integrate with Gemini for image understanding
    - Location inference from image content
    - Keyword and description generation

11. **Full AI Integration**
    - Connect UI to Python backend
    - Implement actual AI models
    - Confidence scoring
    - Fallback mechanisms

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: React Query (TanStack Query v5)
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS
- **File Handling**: react-dropzone
- **Map**: Static Mapbox tiles (Leaflet integration ready)
- **EXIF Reading**: ExifReader
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL (Neon-backed)
- **ORM**: Drizzle ORM
- **Image Processing**: Sharp
- **File Upload**: Multer
- **EXIF Writing**: piexifjs (integrated)
- **Archive**: Archiver (ZIP creation)
- **Validation**: Zod

### Future (AI Layer)
- **Microservice**: Python FastAPI
- **AI**: Gemini API (planned)
- **Image Analysis**: Computer Vision models

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx (with dark mode toggle)
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── UploadZone.tsx
│   │   │   ├── ImageThumbnail.tsx
│   │   │   ├── MapInterface.tsx
│   │   │   ├── MapLayerSelector.tsx
│   │   │   ├── CoordinateInput.tsx
│   │   │   ├── MetadataPanel.tsx
│   │   │   ├── AdvancedExifEditor.tsx
│   │   │   ├── LocationSearch.tsx
│   │   │   ├── SearchHistory.tsx
│   │   │   ├── LocationTemplateManager.tsx
│   │   │   ├── BatchControls.tsx
│   │   │   ├── ImageEditor.tsx
│   │   │   ├── AIAssistant.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── FAQ.tsx
│   │   │   └── ui/ (Shadcn components)
│   │   ├── pages/
│   │   │   ├── Home.tsx (main application)
│   │   │   └── not-found.tsx
│   │   └── App.tsx (with ThemeProvider)
├── server/
│   ├── routes.ts (API endpoints)
│   ├── storage.ts (data access layer)
│   └── index.ts
├── shared/
│   └── schema.ts (Drizzle schemas + Zod validation)
└── design_guidelines.md

## API Endpoints

### Location Templates
- `GET /api/location-templates` - Get all templates
- `POST /api/location-templates` - Create new template
- `DELETE /api/location-templates/:id` - Delete template

### Batch Processing
- `POST /api/batch/process` - Create batch job
- `GET /api/batch/:id` - Get batch job status

### AI Analysis (Planned)
- `POST /api/ai/analyze` - Submit AI analysis job
- `GET /api/ai/:id` - Get AI job result

### Image Processing
- `POST /api/images/process` - Process single image with EXIF
- `POST /api/images/export-zip` - Export multiple images as ZIP

## Database Schema

### Location Templates
- id, name, latitude, longitude, createdAt

### Batch Jobs
- id, status, totalImages, processedImages, latitude, longitude
- keywords, description, documentName, createdAt, completedAt

### AI Jobs
- id, status, jobType, result (JSON), error, createdAt, completedAt

## Key Features

1. **Multi-Format Support**: JPG, PNG, WebP, HEIC
2. **Batch Operations**: Process multiple images at once
3. **Smart Templates**: Save and reuse locations
4. **Advanced Metadata**: Full EXIF control
5. **Map Integration**: Multiple view types
6. **Dark Mode**: System-wide theme support
7. **Image Editing**: Basic adjustments and filters
8. **AI-Ready**: Infrastructure for AI features
9. **Export Options**: Single or batch ZIP download
10. **Search History**: Recent locations tracking

## Development Commands

- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - DB config
- `SESSION_SECRET` - Session encryption key

## Notes

- Images are processed in-memory and not stored on server
- All data persists in PostgreSQL database
- Frontend uses modern React patterns (hooks, query, context)
- Backend follows RESTful conventions
- Type-safe end-to-end with TypeScript and Zod
- Responsive design with mobile-first approach
- Accessibility features with proper test IDs
- Dark mode support with system preference detection

## Future Enhancements

- Real geocoding API integration (Google Maps/Mapbox)
- Python microservice for AI features
- Actual EXIF writing with piexifjs
- Real-time batch progress updates
- User authentication
- Cloud storage integration
- Advanced image editing (crop, filters)
- GPX track import
- Multiple language support
