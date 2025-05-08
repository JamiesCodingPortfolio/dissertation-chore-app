import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import connectDB from './database/database-connections.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const app = express();

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ bruhs: ["bruh", "bruhs"] });
});

const HTTPS_ENABLED = process.env.HTTPS_ENABLED === 'true'
const HTTP_PORT = process.env.HTTP_PORT_NUMBER
const HTTPS_PORT = process.env.HTTPS_PORT_NUMBER

connectDB();

if (HTTPS_ENABLED){

  const privateKey = fs.readFileSync(join(__dirname, '../private.key'), 'utf-8');
  const certificate = fs.readFileSync(join(__dirname, '../certificate.crt'), 'utf-8');

  const httpsServer = https.createServer(
    { key: privateKey, cert: certificate },
    app
  )

  httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log("HTTPS Server started on port 2053")
  })
}

else{
  app.listen(HTTP_PORT, '127.0.0.1', () => {
    console.log('Server running on port 8080');
  })
}