import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser'

import { 
findUserFromSession, 
userInAnyHouseCheck, 
checkLoginValidity, 
checkSessionExists, 
addNewUser, 
connectDB, 
createNewSession, 
findHouse,
newHouse,
newChore} from './database/database-connections.js';

import { hashPassword, generateSalt } from './auth/passwordHasher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const app = express();

const HTTPS_ENABLED = process.env.HTTPS_ENABLED === 'true'
const HTTP_PORT = parseInt(process.env.HTTP_PORT_NUMBER)
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT_NUMBER)

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://j-brown.uk",
      "https://www.j-brown.uk",
      "http://localhost:3000"
    ];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Normalize origin for comparison
    const normalizedOrigin = origin.endsWith('/') 
      ? origin.slice(0, -1) 
      : origin;

    // Check against allowed origins with protocol and domain variations
    if (
      allowedOrigins.some(allowed => 
        normalizedOrigin === allowed ||
        normalizedOrigin.replace(/^https?:\/\/(www\.)?/, 'https://') === allowed
      )
    ) {
      callback(null, true);
    } else {
      console.error('Blocked by CORS:', normalizedOrigin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  // Normalize origin headers
  if (req.headers.origin) {
    req.headers.origin = req.headers.origin
      .replace('http://', 'https://')
      .replace('//www.', '//');
  }
  
  // Set CORS headers explicitly
  const origin = req.headers.origin;
  if (origin && (
    origin.includes('j-brown.uk') || 
    origin.includes('localhost:3000')
  )) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

app.use(cookieParser());
app.use(express.json());


await connectDB();

if (HTTPS_ENABLED){

  const privateKey = fs.readFileSync(join(__dirname, '../private.key'), 'utf-8');
  const certificate = fs.readFileSync(join(__dirname, '../certificate.crt'), 'utf-8');

  const httpsServer = https.createServer(
    { key: privateKey, cert: certificate,

      SNICallback: (servername, cb) => {
        cb(null, httpsServer);
      }

    },
    app
  )

  httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`HTTPS Server started on port ${HTTPS_PORT}`);
  });
}

else{
  app.listen(HTTP_PORT, '127.0.0.1', () => {
    console.log(`Server running on port ${HTTP_PORT}`);
  })
}

app.options('/signup', cors(corsOptions));

app.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    console.log('Recieved email:', email);

    const generatedSalt = generateSalt();
    const hashedPassword = await hashPassword(password, generatedSalt);
    console.log(hashedPassword);

    const newUserId = await addNewUser(name, email, hashedPassword, generatedSalt);

    console.log(newUserId)
    
    const newToken = await createNewSession(newUserId);

    let emailExists;

    if (emailExists === true) {
      setTimeout(() => {
        res.status(406).json({ message: 'This email is already registered to an account.' });
      }, 1000);
    }
    else{
      res.cookie('session-cookie', newToken, {
        httpOnly: true,
        secure: process.env.HTTPS_ENABLED === true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });
      res.status(201).json({ message: 'User registered successfully' });
    }

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  
});

app.get('/', (req, res) => {
  res.status(200).send('Server is running!');
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Recieved email:', email);

    const userInfo = await checkLoginValidity(email, password);

    if (userInfo != null){
      console.log(userInfo);

      const sessionToken = await createNewSession(userInfo);

      res.cookie('session-cookie', sessionToken, {
        httpOnly: true,
        secure: process.env.HTTPS_ENABLED === true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      res.status(201).json({ message: 'Login successful' });
    }

    else{
      throw new Error ("Error logging in");
    }

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
})

app.get('/dashboard', async (req, res) => {
try {
  const token = req.cookies['session-cookie'];

  if (!token) return res.status(401).send('Unauthorized');

  const isValid = await checkSessionExists(token);
  
  console.log("isValid:" ,isValid)
  
  if (isValid == null) {
    res.clearCookie('session-cookie');
    console.log('Invalid Session');
    return res.status(401).send('Invalid session');
  }

  const user = await findUserFromSession(token);

  console.log("User:", user);

  const houses = await userInAnyHouseCheck(user);
  
  console.log("Houses:", houses);

  if (houses.length < 1){
    return res.status(200).json({
      message: 'Authenticated',
      houses
    });
  }

  const houseDetails = [];

  for (const house of houses) {
    console.log("House:", house)
    const detail = await findHouse(house);
    if (!detail) continue;
    
    console.log(`Checking house: ${detail}`);
    houseDetails.push(detail);
  }

  return res.status(200).json({
    message: 'Authenticated with houses',
    houses: houseDetails
  });

  
} catch (error) {
  res.status(500).send('Server error');
}
});

app.post('/new-house', async (req, res) => {
  try {
  console.log('Cookies:', req.cookies);
  const token = req.cookies['session-cookie'];
  const { houseName, maxMembers } = req.body;

  if (!token) return res.status(401).send('Unauthorized');

  console.log(houseName, maxMembers);

  const isValid = await checkSessionExists(token);
  const user = await findUserFromSession(token);

  if (!isValid) {
    res.clearCookie('session-cookie');
    console.log('Invalid Session');
    return res.status(401).send('Invalid session');
  }

  await newHouse(user, houseName, maxMembers);

  console.log("Operation successful")
  res.status(201).json({ 
      message: 'House created successfully',
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/new-chore', async (req, res)  =>{
  try {
    console.log('Cookies', req.cookies);
    const token = req.cookies['session-cookie'];
    const { name, houseName, description } = req.body;

    if (!token) return res.status(401).send('Unauthorized');

    console.log(name, houseName, description);

    const isValid = await checkSessionExists(token);
    const user = await findUserFromSession(token);

    if (!isValid) {
      res.clearCookie('session-cookie');
      console.log('Invalid Session');
      return res.status(401).send('Invalid session');
    }

    await newChore(name, description, houseName, user)

  } catch (error) {
    
  }
});