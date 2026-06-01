import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('strict routing', false);

const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'vinyl.json');

app.use(cors());
app.use(express.json());

const INITIAL_DATA = [
  {
    id: 1,
    title: 'Kind of Blue',
    artist: 'Miles Davis',
    price: 3200,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop',
    description: 'Легендарный джазовый альбом 1959 года. Самая продаваемая джазовая запись всех времён. Модальная революция в звуке.',
    rating: 5.0,
    genre: 'jazz',
    year: 1959,
    label: 'Columbia Records',
    tracklist: 'A1. So What — A2. Freddie Freeloader — A3. Blue in Green — B1. All Blues — B2. Flamenco Sketches',
  },
  {
    id: 2,
    title: 'Nevermind',
    artist: 'Nirvana',
    price: 2800,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    description: 'Революционный альбом 1991 года, изменивший рок-музыку навсегда. Гранж, захвативший мир.',
    rating: 4.9,
    genre: 'rock',
    year: 1991,
    label: 'DGC Records',
    tracklist: 'A1. Smells Like Teen Spirit — A2. In Bloom — A3. Come as You Are — B1. Lithium — B2. Polly — B3. Territorial Pissings',
  },
  {
    id: 3,
    title: 'Selected Ambient Works',
    artist: 'Aphex Twin',
    price: 3800,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
    description: 'Основополагающая работа электронной музыки. Атмосферные пейзажи из другого измерения.',
    rating: 4.8,
    genre: 'electronic',
    year: 1992,
    label: 'Apollo Records',
    tracklist: 'A1. Xtal — A2. Tha — A3. Pulsewidth — B1. Ageispolis — B2. Green Calx — C1. Heliosphan',
  },
  {
    id: 4,
    title: 'Illmatic',
    artist: 'Nas',
    price: 2600,
    inStock: false,
    image: 'https://images.unsplash.com/photo-1598387993441-a364f854cfdf?w=400&h=400&fit=crop',
    description: 'Дебютный альбом 1994 года. Один из величайших хип-хоп альбомов всех времён. Улицы Квинса через лирику.',
    rating: 5.0,
    genre: 'hiphop',
    year: 1994,
    label: 'Columbia Records',
    tracklist: 'A1. The Genesis — A2. N.Y. State of Mind — A3. Halftime — B1. Memory Lane — B2. One Love — B3. The World Is Yours',
  },
  {
    id: 5,
    title: 'What\'s Going On',
    artist: 'Marvin Gaye',
    price: 2900,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
    description: 'Концептуальный соул-альбом 1971 года о войне и социальной справедливости. Вершина жанра.',
    rating: 4.9,
    genre: 'soul',
    year: 1971,
    label: 'Tamla Records',
    tracklist: 'A1. What\'s Going On — A2. What\'s Happening Brother — A3. Flyin\' High — B1. Mercy Mercy Me — B2. Right On — B3. Wholly Holy',
  },
  {
    id: 6,
    title: 'The Dark Side of the Moon',
    artist: 'Pink Floyd',
    price: 4200,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    description: 'Психоделический шедевр 1973 года. 741 неделя в чарте Billboard. Переворот в студийном производстве.',
    rating: 5.0,
    genre: 'rock',
    year: 1973,
    label: 'Harvest Records',
    tracklist: 'A1. Speak to Me — A2. Breathe — A3. On the Run — A4. Time — B1. Money — B2. Us and Them — B3. Brain Damage — B4. Eclipse',
  },
  {
    id: 7,
    title: 'Homework',
    artist: 'Daft Punk',
    price: 3500,
    inStock: false,
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    description: 'Дебют французского дуэта 1997 года. Фанк-хаус, изменивший клубную сцену Европы навсегда.',
    rating: 4.7,
    genre: 'electronic',
    year: 1997,
    label: 'Virgin Records',
    tracklist: 'A1. Daftendirekt — A2. WDPK 83.7 FM — A3. Revolution 909 — B1. Around the World — B2. Rollin\' & Scratchin\'',
  },
  {
    id: 8,
    title: 'A Love Supreme',
    artist: 'John Coltrane',
    price: 3100,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop',
    description: 'Духовный квартет 1965 года. Кульминация авангардного джаза. Медитация длиной в альбом.',
    rating: 4.9,
    genre: 'jazz',
    year: 1965,
    label: 'Impulse! Records',
    tracklist: 'A1. Part 1: Acknowledgement — A2. Part 2: Resolution — B1. Part 3: Pursuance — B2. Part 4: Psalm',
  },
];

const initDB = async () => {
  try {
    await fs.access(DB_PATH);
    console.log('✅ База данных найдена:', DB_PATH);
  } catch {
    console.log('📝 Создание новой базы данных...');
    await fs.writeFile(DB_PATH, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
    console.log('✅ База данных создана:', DB_PATH);
  }
};

const readDB = async () => {
  try {
    return JSON.parse(await fs.readFile(DB_PATH, 'utf-8'));
  } catch {
    return INITIAL_DATA;
  }
};

const writeDB = async (data) => {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

// ─── ROUTES ──────────────────────────────────────────────

app.get('/api/vinyl', async (req, res) => {
  try { res.json(await readDB()); }
  catch { res.status(500).json({ error: 'Ошибка чтения данных' }); }
});

app.get('/api/vinyl/stats', async (req, res) => {
  try {
    const records = await readDB();
    res.json({
      total: records.length,
      inStock: records.filter(r => r.inStock).length,
      avgRating: records.length
        ? (records.reduce((s, r) => s + r.rating, 0) / records.length).toFixed(1) : 0,
      avgPrice: records.length
        ? Math.round(records.reduce((s, r) => s + r.price, 0) / records.length) : 0,
      genres: Object.fromEntries(
        ['jazz', 'rock', 'electronic', 'classical', 'hiphop', 'soul']
          .map(g => [g, records.filter(r => r.genre === g).length])
      ),
    });
  } catch { res.status(500).json({ error: 'Ошибка статистики' }); }
});

app.post('/api/vinyl/reset', async (req, res) => {
  try {
    await writeDB(INITIAL_DATA);
    res.json({ success: true, message: 'БД сброшена', data: INITIAL_DATA });
  } catch { res.status(500).json({ error: 'Ошибка сброса' }); }
});

app.post('/api/vinyl/item', async (req, res) => {
  try {
    const { title, artist, label, price, inStock, image, description, rating, genre, year, tracklist } = req.body;
    if (!title || !artist || !label) {
      return res.status(400).json({ error: 'Обязательные поля: title, artist, label' });
    }
    const records = await readDB();
    const newRecord = {
      id: Date.now(), title, artist, label,
      price: price || 0, inStock: inStock !== undefined ? inStock : true,
      image: image || '', description: description || '',
      rating: rating || 5, genre: genre || 'rock',
      year: year || new Date().getFullYear(),
      tracklist: tracklist || '',
    };
    records.push(newRecord);
    await writeDB(records);
    res.status(201).json({ success: true, data: newRecord });
  } catch { res.status(500).json({ error: 'Ошибка добавления' }); }
});

app.post('/api/vinyl', async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Ожидается массив' });
    await writeDB(req.body);
    res.json({ success: true, count: req.body.length });
  } catch { res.status(500).json({ error: 'Ошибка импорта' }); }
});

app.get('/api/vinyl/:id', async (req, res) => {
  try {
    const records = await readDB();
    const record = records.find(r => r.id === parseInt(req.params.id));
    if (!record) return res.status(404).json({ error: 'Не найдено' });
    res.json(record);
  } catch { res.status(500).json({ error: 'Ошибка чтения' }); }
});

app.put('/api/vinyl/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const records = await readDB();
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
    records[idx] = { ...records[idx], ...req.body, id };
    await writeDB(records);
    res.json({ success: true, data: records[idx] });
  } catch { res.status(500).json({ error: 'Ошибка обновления' }); }
});

app.delete('/api/vinyl/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const records = await readDB();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return res.status(404).json({ error: 'Не найдено' });
    await writeDB(filtered);
    res.json({ success: true, count: filtered.length });
  } catch { res.status(500).json({ error: 'Ошибка удаления' }); }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ error: 'Эндпоинт не найден' }));

// ─── START ─────────────────────────────────────────────────

const startServer = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║   🎵  VINYL HAUS SERVER RUNNING      ║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  API: http://localhost:${PORT}/api       ║`);
    console.log(`║  http://localhost:3000/admin      ║`)
    console.log('╚══════════════════════════════════════╝');
    console.log('');
    console.log('  GET    /api/vinyl         — все записи');
    console.log('  GET    /api/vinyl/stats   — статистика');
    console.log('  GET    /api/vinyl/:id     — по ID');
    console.log('  POST   /api/vinyl/item    — добавить');
    console.log('  POST   /api/vinyl/reset   — сброс БД');
    console.log('  PUT    /api/vinyl/:id     — обновить');
    console.log('  DELETE /api/vinyl/:id     — удалить');
    console.log('');
  });
};

startServer();
export default app;
