import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();

// Optimizations: Compress payloads & enable CORS
app.use(compression());
app.use(cors());
app.use(express.json());

// Set Cache-Control headers so browsers/PWAs don't hit the DB constantly
const cacheMiddleware = (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  next();
};

app.get('/api/thaats', cacheMiddleware, async (req, res) => {
  try {
    const thaats = await prisma.thaat.findMany();
    res.json(thaats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch thaats' });
  }
});

app.get('/api/taals', cacheMiddleware, async (req, res) => {
  try {
    const taals = await prisma.taal.findMany({
      include: {
        variations: true
      }
    });
    // Format back to nested name object for frontend compatibility
    const formatted = taals.map(t => ({
      ...t,
      name: { en: t.name_en, hi: t.name_hi }
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch taals' });
  }
});

app.get('/api/raags', cacheMiddleware, async (req, res) => {
  try {
    const raags = await prisma.raag.findMany();
    res.json(raags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch raags' });
  }
});

app.put('/api/raags/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedRaag = await prisma.raag.update({
      where: { id },
      data: updateData
    });
    
    res.json(updatedRaag);
  } catch (error) {
    console.error("Error updating raag:", error);
    res.status(500).json({ error: 'Failed to update raag' });
  }
});

app.put('/api/variations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { originalBpm } = req.body;
    
    const updatedVar = await prisma.taalVariation.update({
      where: { id },
      data: { originalBpm: parseFloat(originalBpm) }
    });
    
    res.json(updatedVar);
  } catch (error) {
    console.error("Error updating variation BPM:", error);
    res.status(500).json({ error: 'Failed to update variation BPM' });
  }
});

app.post('/api/trim', async (req, res) => {
    try {
        const { url, startTime } = req.body;
        const decodedUrl = decodeURIComponent(url);
        // Map frontend URL to absolute path
        const filePath = path.join(__dirname, '../public', decodedUrl);
        const tempPath = filePath.replace('.mp3', '_manual_trim.mp3');
        
        console.log(`Trimming ${filePath} starting at ${startTime}s`);
        
        // Re-encode to fix timestamps/duration headers after trimming
        const FFMPEG = path.join(__dirname, '../node_modules/ffmpeg-static/ffmpeg.exe');
        execSync(`"${FFMPEG}" -i "${filePath}" -ss ${startTime} -c:a libmp3lame -q:a 2 "${tempPath}" -y -loglevel error`);
        
        fs.copyFileSync(tempPath, filePath);
        fs.unlinkSync(tempPath);
        
        res.json({ success: true });
    } catch (error) {
        console.error("Failed to trim audio:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});