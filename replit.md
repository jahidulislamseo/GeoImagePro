# GeoTag Pro - Advanced Photo Geotagging Application

## Overview
GeoTag Pro হল একটি professional photo geotagging web application যা Python Flask, HTML, CSS এবং vanilla JavaScript দিয়ে তৈরি। এটি JPG, PNG, WebP, এবং HEIC ফরম্যাট support করে এবং images-এ GPS coordinates ও metadata যোগ করার জন্য advanced features প্রদান করে।

## Tech Stack

### Backend - Python Flask
- **Framework**: Flask 3.1.2
- **Database**: PostgreSQL (Neon-backed)
- **Image Processing**: Pillow (PIL)
- **EXIF Handling**: piexif
- **File Upload**: Werkzeug
- **CORS**: flask-cors
- **Archive**: zipfile (built-in)

### Frontend - HTML/CSS/JavaScript
- **HTML5**: Semantic markup
- **CSS3**: Custom styling with CSS variables for dark mode
- **JavaScript**: Vanilla JS (no frameworks)
- **Maps**: Leaflet.js 1.9.4
- **Icons**: SVG inline icons

## Key Features

### 1. Image Upload & Management
- Drag-and-drop interface
- Multiple file upload support
- Image preview gallery
- File type validation (JPG, PNG, WebP, HEIC)
- Maximum 50MB per file

### 2. Interactive Map
- Leaflet.js integration
- Multiple map layers:
  - Street Map (OpenStreetMap)
  - Satellite View (Esri)
  - Terrain View (OpenTopoMap)
- Click-to-place marker
- Draggable marker
- Location search with Nominatim geocoding

### 3. Batch Processing
- Select multiple images
- Apply same geotag to all selected
- Batch progress tracking
- Select all / Deselect all controls

### 4. Location Templates
- Save frequently used locations
- Quick apply templates
- Template management (create, view, delete)
- Database persistence

### 5. Metadata Editor
- GPS coordinates (latitude/longitude)
- Keywords (comma-separated)
- Image description
- Document name
- Copyright information
- Artist/Creator name

### 6. EXIF Writing
- Full GPS coordinate embedding
- Copyright and artist metadata
- Image description
- Keywords support
- Preserves existing EXIF data

### 7. Export Options
- Single image download
- Batch ZIP export
- Geotagged file naming

### 8. Dark Mode
- CSS variable-based theming
- localStorage persistence
- Smooth theme transitions
- Toggle button in header

## Project Structure

```
├── app.py                      # Flask backend server
├── templates/
│   └── index.html             # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css          # Complete CSS with dark mode
│   └── js/
│       └── app.js             # Frontend JavaScript logic
├── requirements.txt           # Python dependencies (auto-generated)
└── replit.md                  # This file
```

## API Endpoints

### Location Templates
- `GET /api/location-templates` - Get all saved templates
- `POST /api/location-templates` - Create new template
  ```json
  {
    "name": "Central Park",
    "latitude": 40.7829,
    "longitude": -73.9654
  }
  ```
- `DELETE /api/location-templates/<id>` - Delete template

### Image Processing
- `POST /api/process-image` - Process single image with EXIF
  - Multipart form data with image file and metadata
  - Returns geotagged image for download

- `POST /api/export-zip` - Export multiple images as ZIP
  - Multipart form data with multiple image files
  - Returns ZIP archive

## Database Schema

### location_templates
```sql
CREATE TABLE location_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### batch_jobs (for future use)
```sql
CREATE TABLE batch_jobs (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL,
    total_images INTEGER NOT NULL,
    processed_images INTEGER DEFAULT 0,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    keywords TEXT,
    description TEXT,
    document_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

## Running the Application

### Development
```bash
python app.py
```
Server starts on `http://localhost:5000`

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured on Replit)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - DB config

## Features Implementation Details

### GPS Coordinate Conversion
```python
def lat_to_dms(lat):
    """Convert decimal latitude to DMS format for EXIF"""
    degrees = int(lat)
    minutes = int((lat - degrees) * 60)
    seconds = int((lat - degrees - minutes / 60) * 3600 * 100)
    return ((degrees, 1), (minutes, 1), (seconds, 100))
```

### EXIF Writing
- Uses `piexif` library for GPS and metadata
- Preserves existing EXIF data
- Supports GPS coordinates, copyright, artist, description, keywords
- Handles multiple image formats

### Map Integration
- Leaflet.js for interactive maps
- Three tile layer options
- Marker drag-and-drop
- Click-to-place functionality
- Search integration with Nominatim API

### Dark Mode Implementation
```css
:root {
    --bg-primary: #ffffff;
    --text-primary: #1a1a1a;
    /* ... light theme variables */
}

[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --text-primary: #f5f5f5;
    /* ... dark theme variables */
}
```

## User Workflow

1. **Upload Images**: Drag and drop or click to browse
2. **Set Location**: 
   - Click on map to place marker
   - Search for location
   - Use saved template
   - Enter coordinates manually
3. **Add Metadata**: Fill in keywords, description, copyright, etc.
4. **Process**:
   - Single image: Click "Process & Download"
   - Multiple images: Select images → "Apply to Selected"
   - Export all: Click "Export All as ZIP"

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required
- No polyfills needed for target browsers

## Security Features

- File type validation
- Secure filename handling
- Maximum file size limit (50MB)
- CORS enabled for development
- No permanent image storage

## Future Enhancements (Optional)

- AI-powered location detection
- Automatic keyword generation
- Image editing tools (crop, rotate, filters)
- User authentication
- Cloud storage integration
- Multiple language support

## Notes

- All image processing happens server-side
- Images are NOT permanently stored
- Database only stores location templates
- Uses localStorage for theme preference
- Responsive design for mobile devices

## Bengali/Bangla Support

এই application Bengali ভাষায় comments এবং documentation support করে। User interface English-এ আছে কিন্তু সহজে Bengali-এ অনুবাদ করা যাবে।

## License

MIT License - Free to use and modify
