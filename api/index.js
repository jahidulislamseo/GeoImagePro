// api/index.js - Vercel Serverless Function
import express from 'express';
import { registerRoutes } from '../server/routes.js';

const app = express();

// Register all routes
registerRoutes(app);

export default app;
