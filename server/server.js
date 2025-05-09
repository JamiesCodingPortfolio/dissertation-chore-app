import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

import connectDB, { checkEmailExists } from './database/database-connections.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000'
}));

const HTTPS_ENABLED = process.env.HTTPS_ENABLED === 'true'
const HTTP_PORT = parseInt(process.env.HTTP_PORT_NUMBER)
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT_NUMBER)

console.log(HTTP_PORT);

connectDB();

if (HTTPS_ENABLED){

  const privateKey = fs.readFileSync(join(__dirname, '../private.key'), 'utf-8');
  const certificate = fs.readFileSync(join(__dirname, '../certificate.crt'), 'utf-8');

  const httpsServer = https.createServer(
    { key: privateKey, cert: certificate },
    app
  )

  httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`HTTPS Server started on port ${HTTPS_PORT}`)
  })
}

else{
  app.listen(HTTP_PORT, '127.0.0.1', () => {
    console.log(`Server running on port ${HTTP_PORT}`);
  })
}

app.post('/signup', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('Recieved email:', email);

    const emailExists = await checkEmailExists(email);
    
    if (emailExists === true) {
      setTimeout(() => {
        res.status(406).json({ message: 'Email already in use' });
      }, 1000);
    }
    else{
      setTimeout(() => {
        res.status(201).json({ message: 'User registered successfully' });
      }, 1000);
    }

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
})