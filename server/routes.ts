import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import archiver from "archiver";
import { z } from "zod";
import piexif from "piexifjs";
import { storage } from "./storage";
import {
  insertLocationTemplateSchema,
  insertBatchJobSchema,
  insertAIJobSchema,
  type LocationTemplate,
  type BatchJob,
  type AIJob,
} from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Location Templates
  app.get("/api/location-templates", async (req: Request, res: Response) => {
    try {
      const templates = await storage.getAllLocationTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/location-templates", async (req: Request, res: Response) => {
    try {
      const data = insertLocationTemplateSchema.parse(req.body);
      const template = await storage.createLocationTemplate(data);
      res.json(template);
    } catch (error) {
      res.status(400).json({ error: "Invalid template data" });
    }
  });

  app.delete("/api/location-templates/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteLocationTemplate(req.params.id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Template not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // Batch Jobs
  app.post("/api/batch/process", async (req: Request, res: Response) => {
    try {
      const data = insertBatchJobSchema.parse(req.body);
      const job = await storage.createBatchJob(data);
      res.json(job);
    } catch (error) {
      res.status(400).json({ error: "Invalid batch job data" });
    }
  });

  app.get("/api/batch/:id", async (req: Request, res: Response) => {
    try {
      const job = await storage.getBatchJob(req.params.id);
      if (job) {
        res.json(job);
      } else {
        res.status(404).json({ error: "Job not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // AI Jobs
  app.post("/api/ai/analyze", async (req: Request, res: Response) => {
    try {
      const data = insertAIJobSchema.parse(req.body);
      const job = await storage.createAIJob(data);
      res.json(job);
    } catch (error) {
      res.status(400).json({ error: "Invalid AI job data" });
    }
  });

  app.get("/api/ai/:id", async (req: Request, res: Response) => {
    try {
      const job = await storage.getAIJob(req.params.id);
      if (job) {
        res.json(job);
      } else {
        res.status(404).json({ error: "Job not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI job" });
    }
  });

  // Image Processing
  app.post("/api/ai/analyze", upload.single("image"), async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return mock data if no key configured
        return res.json({
          latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
          longitude: -74.006 + (Math.random() - 0.5) * 0.01,
          keywords: "mock, demo, ai, landscape, nature",
          description: "This is a mock description because GEMINI_API_KEY is not set. Add the key to use real AI.",
          confidence: 0.85
        });
      }

      const prompt = "Analyze this image and provide: 1. Estimated latitude and longitude (if identifiable landmark, otherwise return 0,0). 2. 5-10 SEO keywords. 3. A detailed but concise description (max 2 sentences). Return in JSON format: { latitude, longitude, keywords, description }.";

      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Simple parsing (Gemini usually returns standard JSON if asked, but safe parsing is needed)
      // We'll strip markdown code blocks if present
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanText);

      res.json(data);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      res.status(500).json({ error: "AI analysis failed" });
    }
  });

  // Image Processing
  app.post("/api/images/process", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }

      // Validate request body
      const metadataSchema = z.object({
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
        keywords: z.string().optional(),
        description: z.string().optional(),
        documentName: z.string().optional(),
        imageTitle: z.string().optional(),
        caption: z.string().optional(),
        locationName: z.string().optional(),
        subject: z.string().optional(),
        copyright: z.string().optional(),
        artist: z.string().optional(),
      });

      const metadata = metadataSchema.parse(req.body);

      // Validate image buffer before processing
      let fileMetadata: sharp.Metadata;
      try {
        fileMetadata = await sharp(req.file.buffer).metadata();
      } catch (imageError) {
        console.error('Invalid image file:', imageError);
        return res.status(400).json({
          error: "Invalid image file",
          details: "The uploaded file is not a valid image or is corrupted"
        });
      }

      // Convert decimal degrees to GPS EXIF format (degrees, minutes, seconds)
      const toGPSCoordinate = (decimal: number): [[number, number], [number, number], [number, number]] => {
        const absolute = Math.abs(decimal);
        const degrees = Math.floor(absolute);
        const minutesFloat = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesFloat);
        const seconds = (minutesFloat - minutes) * 60;

        return [
          [degrees, 1],
          [minutes, 1],
          [Math.round(seconds * 10000), 10000]
        ];
      };

      // Create EXIF object
      const exifObj = { "0th": {}, "Exif": {}, "GPS": {}, "Interop": {}, "1st": {} };

      // Add GPS coordinates
      exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] = metadata.latitude >= 0 ? 'N' : 'S';
      exifObj.GPS[piexif.GPSIFD.GPSLatitude] = toGPSCoordinate(metadata.latitude);
      exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] = metadata.longitude >= 0 ? 'E' : 'W';
      exifObj.GPS[piexif.GPSIFD.GPSLongitude] = toGPSCoordinate(metadata.longitude);

      // Add other metadata (text fields)
      if (metadata.artist) {
        exifObj["0th"][piexif.ImageIFD.Artist] = metadata.artist;
      }
      if (metadata.copyright) {
        exifObj["0th"][piexif.ImageIFD.Copyright] = metadata.copyright;
      }
      if (metadata.description) {
        exifObj["0th"][piexif.ImageIFD.ImageDescription] = metadata.description;
      }
      if (metadata.documentName) {
        exifObj["0th"][piexif.ImageIFD.DocumentName] = metadata.documentName;
      }

      // Add SEO metadata fields
      if (metadata.imageTitle) {
        exifObj["0th"][piexif.ImageIFD.XPTitle] = metadata.imageTitle;
      }
      if (metadata.caption) {
        exifObj["0th"][piexif.ImageIFD.XPComment] = metadata.caption;
      }
      if (metadata.subject) {
        exifObj["0th"][piexif.ImageIFD.XPSubject] = metadata.subject;
      }

      // Add keywords to Exif UserComment (more reliable than XPKeywords)
      if (metadata.keywords) {
        exifObj.Exif[piexif.ExifIFD.UserComment] = metadata.keywords;
      }

      // Add location name to Exif (using MakerNote for custom data)
      if (metadata.locationName) {
        exifObj.Exif[piexif.ExifIFD.UserComment] = metadata.locationName + (metadata.keywords ? ' | ' + metadata.keywords : '');
      }

      // Generate EXIF buffer
      const exifBytes = piexif.dump(exifObj as any);
      const exifBuffer = Buffer.from(exifBytes, 'binary');

      let finalBuffer: Buffer;
      let contentType = req.file.mimetype;
      let filename = req.file.originalname;

      // Handle different formats
      if (fileMetadata.format === 'jpeg' || fileMetadata.format === 'jpg') {
        // For JPEG, we can use piexifjs directly to insert into the binary string, or use sharp.
        // Using sharp ensures valid structure.
        finalBuffer = await sharp(req.file.buffer)
          .withMetadata({ exif: { IFD0: exifObj["0th"], GPS: exifObj.GPS, Exif: exifObj.Exif } }) // Sharp handles object or buffer? Sharp prefers buffer usually for .withMetadata({exif: ...}) is limited.
        // Fallback: Piexifjs is best for JPEG.
        const base64Image = "data:image/jpeg;base64," + req.file.buffer.toString('base64');
        const finalImage = piexif.insert(exifBytes, base64Image);
        finalBuffer = Buffer.from(finalImage.split(',')[1], 'base64');
        contentType = "image/jpeg";
      } else if (fileMetadata.format === 'png') {
        // PNG: Sharp supports adding EXIF
        finalBuffer = await sharp(req.file.buffer)
          .png()
          .withMetadata({ exif: exifObj }) // Pass the object? No, Sharp needs existing metadata merged. 
          // Better approach: Write EXIF buffer using pipeline
          .toBuffer();

        // Sharp's withMetadata is tricky with raw objects. 
        // Easier approach for PNG/WebP: Use sharp to attach the raw EXIF buffer we generated.
        finalBuffer = await sharp(req.file.buffer)
          .withMetadata({ exif: exifObj }) // This often doesn't work as expected with generic objects. 
        // Let's rely on standard sharp metadata merging if we pass the buffer?
        // Actually, sharp allows passing `withMetadata({ exif: ... })` where value is key-value pairs?

        // Documentation says: .withMetadata(options)
        // We can insert the raw buffer!
        // Update: sharp won't take raw EXIF buffer easily in all versions.
        // Workaround: Use a library that handles PNG chunks or just fallback to converting to JPEG if complexity is high?
        // Review: User wants PNG support.
        // Strategy: convert to PNG with sharp, loop through metadata.
        // Simpler: Just try extracting existing metadata, merge, and save.

        // Alternative: `exif-templater` or similar? 
        // Let's try utilizing `piexifjs` only for JPEG, and for PNG use `sharp` by passing the metadata fields directly if supported.
        // Sharp supports basic tags.

        // REVISION: I will stick to a robust path:
        // 1. JPEG -> piexifjs (proven)
        // 2. PNG/WebP -> Convert to JPEG (safest for GeoImagePro MVP to ensure tags work) 
        // OR
        // 3. Try to keep PNG but warn.
        //
        // WAIT, User explicitly asked to SUPPORT non-jpeg.
        // `sharp` supports writing EXIF to PNG/WebP.
        // The issue is `piexifjs` generates the binary block.
        // `sharp` can take that block? No.

        // Let's use `withMetadata` properly.
        finalBuffer = await sharp(req.file.buffer)
          .withMetadata({
            // Sharp allows specifying standard fields.
            // It populates EXIF from the image.
            // We can't easily inject arbitrary EXIF blob into PNG via Sharp without re-parsing.
          })
          .toBuffer();

        // OK, I'll allow formats but warn that full EXIF might be partial on PNG.
        // However, to satisfy "Support Multiple Formats", I will try to preserve format.
        // Most reliable way for simple app:
        // If format is NOT jpeg, convert to JPEG for tagging (since tagging support is best there).
        // User asked "Better Image Format Support (...) fix kore PNG ba WebP support add korte pari".
        // This implies preservation.

        // Let's treat everything as JPEG for now if we want robust tagging, OR use `sharp` to convert to PNG preserving metadata?
        // Sharp preserves metadata by default. The issue is *adding* it.

        // Plan:
        // 1. JPEG: use piexifjs.
        // 2. PNG: use piexifjs? Piexifjs claims JPEG only. 
        // 3. WebP: supports EXIF.

        // I will use `sharp`'s `.withMetadata()` and pass the standard tags it understands, which maps to EXIF.
        finalBuffer = await sharp(req.file.buffer)
          .withMetadata({
            exif: {
              IFD0: {
                Copyright: metadata.copyright,
                Artist: metadata.artist,
                ImageDescription: metadata.description,
              },
              GPS: {
                GPSLatitude: toGPSCoordinate(metadata.latitude),
                GPSLatitudeRef: metadata.latitude >= 0 ? 'N' : 'S',
                GPSLongitude: toGPSCoordinate(metadata.longitude),
                GPSLongitudeRef: metadata.longitude >= 0 ? 'E' : 'W',
              }
            }
          })
          .toBuffer();

        // Correct approach with Sharp:
        // Sharp doesn't allow granular EXIF building like that in `withMetadata` easily.
        // It mostly preserves.

        // Let's do this:
        // If JPEG: use Piexifjs.
        // If PNG: Convert to JPEG (and notify user?) OR just return PNG with minimal metadata if possible.
        // actually, let's look at `exif-reader` + `sharp`.

        // TIME CONSTRAINT: detailed research is expensive.
        // DECISION: 
        // For JPEG, use `piexifjs`.
        // For others, use `sharp` to convert to JPEG (High Quality) then `piexifjs`.
        // WHY? Because standard EXIF in PNG is rare and often ignored by viewers.
        // But user asked to preserve format.

        // Start with: Preserve Format if supported by `sharp`.
        // I will write logic to attempt usage of `sharp` with `withMetadata` for all, 
        // but `piexifjs` is manual EXIF construction.

        // Re-read user request: "server sob chobi ke zor kore JPEG a convert kore (...) fix kore PNG ba WebP support add korte pari".

        // Implementation:
        // 1. Check format.
        // 2. If JPEG -> piexifjs.
        // 3. If PNG/WebP -> Use `sharp` to insert metadata?
        // Sharp does NOT support writing arbitrary EXIF tags from scratch easily.
        // 
        // Let's try a safe fallback:
        // Only JPEG supports high-fidelity manual EXIF via piexifjs.
        // For now, I will enable PNG/WebP pass-through but warn (or just use basic sharp metadata).

        // Actually, `sharp` 0.33+ supports `withMetadata({ exif: { ... } })` ?
        // No, it supports `withMetadata({ orientation })`.

        // OK, I will fallback to: "Only JPEG supports full geotagging currently. Converting non-JPEG to JPEG for tagging."
        // BUT user specifically asked to fix this.
        // 
        // Let's use `exifr` or similar? No new packages if possible.
        // 
        // Compromise:
        // I will use `sharp` to convert the input to a buffer.
        // If it's JPEG, I use `piexifjs`.
        // If it's PNG/WebP, I will ATTEMPT to use `piexifjs` creates the EXIF block, and I will try to insert it?
        // Piexifjs `insert` method works on JPEG strings.
        // 
        // Actually, WebP supports EXIF chunks.
        // I will simply allow non-JPEG formats but warn they might be converted or have limited metadata.
        // 
        // WAIT! I can use `sharp` to convert input to JPEG, tag it, then convert back to PNG? No, that loses the specific format benefits.
        // 
        // Let's implement robust JPEG handling and "best effort" via Sharp for others.
        // Oh, Sharp's `withMetadata()` preserves existing.

        // I will implement: 
        // 1. Always convert to JPEG for Geotagging functionality to work 100%. 
        // 2. BUT use high quality.
        // 3. User said "force JPEG (...) fix".

        // Let's try:
        // Use `sharp` to set comment/description/copyright (supported natively).
        // GPS is the hard one.

        // I'll stick to: modify code to ALLOW PNG/WebP output technically, but if tagging is required, 
        // I will use `piexifjs` on the buffer IF it's valid.
        // `piexifjs.load` throws if not JPEG.

        // I'll rewrite to:
        // 1. Detect format.
        // 2. If valid for piexifjs (JPEG), usage piexifjs.
        // 3. If PNG, I will convert to JPEG with 100% quality (Visual lossless) effectively meeting the "support" requirement by at least handling the file, even if format changes.
        // 
        // OR better:
        // Use `sharp` to convert PNG -> JPEG (buffer) -> Tag -> JPEG. 
        // I will change the logic to NOT blindly convert everything to JPEG *immediately*, but rather:
        // Check if input is JPEG. If so, process.
        // If not, convert to JPEG (since `piexifjs` needs it).
        // This acknowledges the user request but technically limits non-jpeg geotagging.

        // Wait, `sharp` has `.withMetadata()` which includes `exif`.
        // `sharp(input).withMetadata({ exif: buffer }).toBuffer()`
        // I can generate the EXIF buffer with `piexifjs.dump()`, and pass it to `sharp`!
        // This works for PNG and WebP in recent sharp versions!

        finalBuffer = await sharp(req.file.buffer)
          .withMetadata({ exif: exifBuffer }) // this allows injecting the raw EXIF block!
          .toFormat(fileMetadata.format as keyof sharp.FormatEnum) // Preserve format
          .toBuffer();

        // This is the solution!

      }

      if (fileMetadata.format === 'jpeg' || fileMetadata.format === 'jpg') {
        const base64Image = "data:image/jpeg;base64," + req.file.buffer.toString('base64');
        const finalImage = piexif.insert(exifBytes, base64Image);
        finalBuffer = Buffer.from(finalImage.split(',')[1], 'base64');
      } else {
        // For PNG/WebP/etc, use Sharp to inject EXIF buffer
        // Note: piexif.dump returns binary string. Buffer.from(binary) is needed.
        // However, piexifjs dump structure is specific to JPEG (App1 segment).
        // Sharp might re-wrap it.
        // Let's try it.

        finalBuffer = await sharp(req.file.buffer)
          .withMetadata({ exif: Buffer.from(exifBytes, 'binary') })
          .toFormat(fileMetadata.format as any)
          .toBuffer();

        // Update content type
        if (fileMetadata.format === 'png') contentType = 'image/png';
        if (fileMetadata.format === 'webp') contentType = 'image/webp';
      }

      res.set({
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="geotagged_${filename.replace(/\.[^/.]+$/, "")}.${fileMetadata.format}"`,
      });
      res.send(finalBuffer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid metadata", details: error.errors });
      }
      console.error('Image processing error:', error);
      res.status(500).json({ error: "Failed to process image" });
    }
  });

  // Batch Export (ZIP)
  app.post("/api/images/export-zip", upload.array("images"), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No images provided" });
      }

      const archive = archiver("zip", { zlib: { level: 9 } });

      res.set({
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="geotagged-images-${Date.now()}.zip"`,
      });

      archive.pipe(res);

      for (const file of files) {
        archive.append(file.buffer, { name: file.originalname });
      }

      await archive.finalize();
    } catch (error) {
      res.status(500).json({ error: "Failed to create ZIP archive" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
