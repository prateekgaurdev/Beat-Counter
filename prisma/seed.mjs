import { PrismaClient } from '@prisma/client';
import { thaats } from '../src/data/thaats.js';
import { taals } from '../src/data/taals.js';
import { raags } from '../src/data/raags.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Thaats...');
  for (const t of thaats) {
    await prisma.thaat.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        name: t.name,
        swaras: t.swaras,
        nature: t.nature,
        sample_raag: t.sample_raag,
        mood: t.mood,
      }
    });
  }

  console.log('Seeding Taals...');
  for (const t of taals) {
    await prisma.taal.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        name_en: t.name.en,
        name_hi: t.name.hi,
        tradition: t.tradition,
        maatras: t.maatras,
        vibhags: t.vibhags,
        taali_beats: t.taali_beats || [],
        khali_beats: t.khali_beats || [],
        sam: t.sam || 1,
        theka: t.theka || [],
        theka_devanagari: t.theka_devanagari || [],
        default_bpm: t.default_bpm || 120,
        bpm_range: t.bpm_range || [30, 300],
        description: t.description || null,
        category: t.category || null,
        used_in: t.used_in || null,
        typical_laya: t.typical_laya || null,
        theka_display: t.theka_display || null,
        anga_structure: t.anga_structure || null,
      }
    });
  }

  console.log('Seeding Raags...');
  for (const r of raags) {
    // Some raags have "unknown" or "independent / mixed thaat" thaat
    const thaat_id = r.thaat === "unknown" || r.thaat === "independent / mixed thaat" ? null : r.thaat;
    
    await prisma.raag.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        name: r.name,
        thaat_id: thaat_id,
        thaat_notes: r.thaat_notes || null,
        aroh: r.aroh,
        avroh: r.avroh,
        pakad: r.pakad,
        vadi: r.vadi,
        samvadi: r.samvadi,
        time: r.time,
        prahar: r.prahar || null,
        jati: r.jati,
        saptak_pradhanata: r.saptak_pradhanata || null,
        tanpura_tuning: r.tanpura_tuning || null,
        rasa: r.rasa || null,
        description: r.description || null,
        audios: r.audios || (r.audioUrl ? [{url: r.audioUrl, title: "Audio 1"}] : null),
        film_songs: r.film_songs || null,
        recordings: r.recordings || null,
      }
    });
  }
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })