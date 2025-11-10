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
      let processedBuffer: Buffer;
      try {
        // Test if image is valid by getting metadata
        await sharp(req.file.buffer).metadata();
        
        // Process image with sharp (optimize, convert to JPEG)
        processedBuffer = await sharp(req.file.buffer)
          .jpeg({ quality: 95 })
          .toBuffer();
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

      // Convert buffer to base64 for piexifjs
      const base64Image = "data:image/jpeg;base64," + processedBuffer.toString('base64');

      // Load existing EXIF data or create new
      let exifObj: any;
      try {
        exifObj = piexif.load(base64Image);
      } catch (e) {
        // If no EXIF data exists, create new
        exifObj = { "0th": {}, "Exif": {}, "GPS": {}, "Interop": {}, "1st": {} };
      }

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

      // Convert EXIF object to bytes
      const exifBytes = piexif.dump(exifObj);

      // Insert EXIF data into image
      const finalImage = piexif.insert(exifBytes, base64Image);

      // Convert back to buffer
      const finalBuffer = Buffer.from(finalImage.split(',')[1], 'base64');

      res.set({
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="geotagged_${req.file.originalname}"`,
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
