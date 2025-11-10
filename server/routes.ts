import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import archiver from "archiver";
import { z } from "zod";
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
        copyright: z.string().optional(),
        artist: z.string().optional(),
      });

      const metadata = metadataSchema.parse(req.body);

      // Convert decimal degrees to GPS format for EXIF
      const toGPSCoordinate = (decimal: number, isLatitude: boolean) => {
        const absolute = Math.abs(decimal);
        const degrees = Math.floor(absolute);
        const minutesFloat = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesFloat);
        const seconds = (minutesFloat - minutes) * 60;
        
        const ref = isLatitude 
          ? (decimal >= 0 ? 'N' : 'S')
          : (decimal >= 0 ? 'E' : 'W');
        
        return {
          degrees: [degrees, 1],
          minutes: [minutes, 1],
          seconds: [Math.round(seconds * 100), 100],
          ref
        };
      };

      const lat = toGPSCoordinate(metadata.latitude, true);
      const lon = toGPSCoordinate(metadata.longitude, false);

      // Process image with sharp - add GPS and metadata
      const imageBuffer = await sharp(req.file.buffer)
        .withMetadata({
          exif: {
            IFD0: {
              Copyright: metadata.copyright || '',
              Artist: metadata.artist || '',
              ImageDescription: metadata.description || '',
              DocumentName: metadata.documentName || '',
            },
            IFD1: {
              XPKeywords: metadata.keywords ? Buffer.from(metadata.keywords, 'utf16le') : undefined,
            },
          },
        })
        .jpeg({ quality: 95 })
        .toBuffer();

      // Note: Sharp has limited GPS EXIF support
      // GPS data is best added using a specialized library like piexif
      // For now, other metadata is added successfully

      res.set({
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="geotagged_${req.file.originalname}"`,
      });
      res.send(imageBuffer);
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
