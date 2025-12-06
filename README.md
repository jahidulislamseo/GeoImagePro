# GeoImagePro 🌍📸

Advanced photo geotagging tool with AI-powered location detection and batch processing capabilities.

## Features

### 🗺️ Drag & Drop to Map
- Drag images directly onto the map to set their location
- Visual feedback during drag operations
- Instant coordinate assignment

### 🖼️ Multi-Format Support
- JPEG, PNG, and WebP support
- Format preservation during processing
- Intelligent EXIF metadata handling

### 💠 Gallery View
- Responsive grid layout for batch uploads
- Visual thumbnail previews
- Quick selection and management

### 🤖 AI-Powered Analysis
- **Google Gemini 2.0 Flash** integration
- Automatic location detection from landmarks
- Smart keyword generation
- AI-generated image descriptions

### ⚡ Batch Processing
- Process multiple images simultaneously
- Bulk metadata application
- ZIP export for geotagged images

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Express.js, Node.js
- **Map:** Leaflet, React-Leaflet
- **Image Processing:** Sharp, piexifjs
- **AI:** Google Generative AI (Gemini 2.0 Flash)
- **Styling:** Tailwind CSS

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jahidulislamseo/GeoImagePro.git
cd GeoImagePro

# Install dependencies
npm install

# Create .env file and add your API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Vercel
- Render
- Other platforms

## Usage

1. **Upload Images:** Drag and drop images or click to select
2. **Set Location:** 
   - Click on the map
   - Drag image directly to map location
   - Use AI to detect location
3. **Add Metadata:** Fill in keywords, description, and other EXIF data
4. **AI Analysis:** Click "Smart Analyze Image" for AI-powered suggestions
5. **Export:** Download individual images or batch export as ZIP

## Project Structure

```
GeoImagePro/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── hooks/       # Custom hooks
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # In-memory storage
├── shared/              # Shared types and schemas
└── package.json
```

## API Endpoints

- `POST /api/images/process` - Process and geotag images
- `POST /api/images/export-zip` - Export multiple images as ZIP
- `POST /api/ai/analyze` - AI-powered image analysis
- `GET/POST /api/location-templates` - Manage location templates
- `GET/POST /api/batch-jobs` - Batch processing jobs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Author

**Jahidul Islam**
- GitHub: [@jahidulislamseo](https://github.com/jahidulislamseo)

## Acknowledgments

- OpenStreetMap for map tiles
- Google Gemini AI for image analysis
- Sharp for image processing
- Leaflet for interactive maps
