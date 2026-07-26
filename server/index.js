import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/thaats', async (req, res) => {
  try {
    const thaats = await prisma.thaat.findMany();
    res.json(thaats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch thaats' });
  }
});

app.get('/api/taals', async (req, res) => {
  try {
    const taals = await prisma.taal.findMany();
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

app.get('/api/raags', async (req, res) => {
  try {
    const raags = await prisma.raag.findMany();
    res.json(raags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch raags' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});