import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const privateKey = fs.readFileSync(join(__dirname, '../private.key'), 'utf-8');
const certificate = fs.readFileSync(join(__dirname, '../certificate.key'), 'utf-8');

const app = express();

app.get("/api", (req, res) => {
  res.json({ bruhs: ["bruh", "bruhs"] });
});

const httpsServer = https.createServer(
  { key: privateKey, cert: certificate },
  app
);

httpsServer.listen(443, () => {
  console.log("HTTPS Server started on port 443");
});
