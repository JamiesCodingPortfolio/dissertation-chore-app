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
newHouse} from './database/database-connections.js';

import { hashPassword, generateSalt } from './auth/passwordHasher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());

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
  
})

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