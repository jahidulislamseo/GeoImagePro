import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.json({
                latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
                longitude: -74.006 + (Math.random() - 0.5) * 0.01,
                keywords: "mock, demo, ai, landscape, nature",
                description: "This is a mock description because GEMINI_API_KEY is not set.",
                confidence: 0.85
            });
        }

        const prompt = "Analyze this image and provide: 1. Estimated latitude and longitude (if identifiable landmark, otherwise return 0,0). 2. 5-10 SEO keywords. 3. A detailed but concise description (max 2 sentences). Return in JSON format: { latitude, longitude, keywords, description }.";

        const imagePart = {
            inlineData: {
                data: file.buffer.toString("base64"),
                mimeType: file.mimetype,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText);

        res.json(data);
    } catch (error) {
        console.error("AI Analysis failed:", error);
        res.status(500).json({ error: "AI analysis failed" });
    }
}
