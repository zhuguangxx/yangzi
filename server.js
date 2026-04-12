import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth.js';
import customersRouter from './routes/customers.js';
import imagesRouter from './routes/images.js';
import favoritesRouter from './routes/favorites.js';
import demandsRouter from './routes/demands.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 80;
const HOST = '0.0.0.0';

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);
app.use('/api/images', imagesRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/demands', demandsRouter);

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  const portStr = PORT == 80 ? '' : `:${PORT}`;
  console.log(`Door Showcase System Started`);
  console.log(`   Local: http://localhost${portStr}`);
  console.log(`   LAN: http://${localIP}${portStr}`);
  console.log(`   Admin: http://${localIP}${portStr}/admin`);
});
