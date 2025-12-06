import type { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import sharp from 'sharp';
import piexif from 'piexifjs';
import { z } from 'zod';

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse multipart form data
        const multerHandler = upload.single('image');

        await new Promise((resolve, reject) => {
            multerHandler(req as any, res as any, (err) => {
                if (err) reject(err);
                else resolve(null);
            });
        });

        const file = (req as any).file;
        if (!file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Validate metadata
        const metadataSchema = z.object({
            latitude: z.coerce.number(),
            longitude: z.coerce.number(),
            keywords: z.string().optional(),
            description: z.string().optional(),
        });

        const metadata = metadataSchema.parse(req.body);

        // Process image with sharp and piexif
        const fileMetadata = await sharp(file.buffer).metadata();

        // Convert coordinates to GPS format
        const toGPSCoordinate = (decimal: number) => {
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
        const exifObj: any = { "0th": {}, "Exif": {}, "GPS": {}, "Interop": {}, "1st": {} };

        exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] = metadata.latitude >= 0 ? 'N' : 'S';
        exifObj.GPS[piexif.GPSIFD.GPSLatitude] = toGPSCoordinate(metadata.latitude);
        exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] = metadata.longitude >= 0 ? 'E' : 'W';
        exifObj.GPS[piexif.GPSIFD.GPSLongitude] = toGPSCoordinate(metadata.longitude);

        if (metadata.description) {
            exifObj["0th"][piexif.ImageIFD.ImageDescription] = metadata.description;
        }

        const exifBytes = piexif.dump(exifObj);
        const exifBuffer = Buffer.from(exifBytes, 'binary');

        let finalBuffer: Buffer;
        let contentType = file.mimetype;

        if (fileMetadata.format === 'jpeg' || fileMetadata.format === 'jpg') {
            const base64Image = "data:image/jpeg;base64," + file.buffer.toString('base64');
            const finalImage = piexif.insert(exifBytes, base64Image);
            finalBuffer = Buffer.from(finalImage.split(',')[1], 'base64');
        } else {
            finalBuffer = await sharp(file.buffer)
                .withMetadata({ exif: exifBuffer })
                .toFormat(fileMetadata.format as any)
                .toBuffer();
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="geotagged_${file.originalname}"`);
        res.send(finalBuffer);
    } catch (error) {
        console.error('Image processing error:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
}
