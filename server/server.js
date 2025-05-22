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
newChore,
findChoresAssignedToUser,
findHouseFromName,
modifyHouseName,
deleteHouse,
getUserById, 
findUsersInHouse, 
findUserByEmail,
findHouseDetails,
createJoinRequest,
getHouseCreatorId,
getJoinRequests,
handleJoinRequest} from './database/database-connections.js';

import { hashPassword, generateSalt } from './auth/passwordHasher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const app = express();

app.use(express.static('dist'));

const HTTPS_ENABLED = process.env.HTTPS_ENABLED === 'true'
const HTTP_PORT = parseInt(process.env.HTTP_PORT_NUMBER)
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT_NUMBER)
const DOMAIN = process.env.VITE_DOMAIN_NAME

let originPoint;

if (DOMAIN === ''){
  originPoint = "http://localhost:3000";
}
else{
  originPoint = `${DOMAIN}`;
}

//console.log(HTTP_PORT);

app.use(cors({
  origin: originPoint,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());


await connectDB();

if (HTTPS_ENABLED){

  const privateKey = fs.readFileSync(join(__dirname, '../private.key'), 'utf-8');
  const certificate = fs.readFileSync(join(__dirname, '../certificate.crt'), 'utf-8');

  const httpsServer = https.createServer(
    { key: privateKey, cert: certificate},
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

app.post('/api/signup', async (req, res) => {
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

app.get('/api', (req, res) => {
  res.status(200).send('Server is running!');
});

app.post('/api/login', async (req, res) => {
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

app.get('/api/dashboard', async (req, res) => {
try {
  const token = req.cookies['session-cookie'];

  if (!token) return res.status(401).send('Unauthorized');

  const isValid = await checkSessionExists(token);
  
  if (isValid == null) {
    res.clearCookie('session-cookie');
    console.log('Invalid Session');
    return res.status(401).send('Invalid session');
  }

  const user = await findUserFromSession(token);
  const houses = await userInAnyHouseCheck(user);
  
  if (houses.length < 1){
    return res.status(200).json({
      message: 'Authenticated',
      houses: []
    });
  }

  const houseDetails = [];

  for (const houseId of houses) {
    const house = await findHouseDetails(houseId);
    if (!house) continue;
    
    // Only send necessary information, no IDs
    houseDetails.push({
      name: house.houseName,
      maxMembers: house.maxHouseholdMembers
    });
  }

  const userChores = await findChoresAssignedToUser(user);

  return res.status(200).json({
    message: 'Authenticated with houses',
    houses: houseDetails,
    chores: userChores
  });

} catch (error) {
  res.status(500).send('Server error');
}
});

app.post('/api/new-house', async (req, res) => {
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

app.post('/api/new-chore', async (req, res)  =>{
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

    res.status(201).json({ 
      success: true,
      message: 'Chore created successfully',
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/update-house', async (req, res) => {
  try {
    console.log("Update house requested")
    const { originalName, newName } = req.body;
    
    const token = req.cookies['session-cookie'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const isValid = await checkSessionExists(token);
    if (!isValid) {
      res.clearCookie('session-cookie');
      return res.status(401).json({ error: 'Invalid session' });
    }

    const houseId = await findHouseFromName(originalName);

    console.log("House ID: ", houseId)
    
    const result = await modifyHouseName(houseId, newName)

    if (result){
      console.log('Changes made to houseId: ', houseId);
    }
    else{
      console.log('No changes made to houseId: ', houseId);
    }

    console.log(result)

    if (result === 0) {
      return res.status(404).json({ error: 'House not found / changes not made' });
    }

    res.json({ success: true, newName });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/verify-session', async (req, res) => {
  try {
    const token = req.cookies['session-cookie'];
    if (!token) return res.json({ isAuthenticated: false });

    const isValid = await checkSessionExists(token);
    res.json({ isAuthenticated: isValid });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/delete-house', async (req, res) => {
  try {
    const { houseName } = req.body;
    const token = req.cookies['session-cookie'];
    
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const isValid = await checkSessionExists(token);
    if (!isValid) {
      res.clearCookie('session-cookie');
      return res.status(401).json({ error: 'Invalid session' });
    }

    const houseId = await findHouseFromName(houseName);
    if (!houseId) {
      return res.status(404).json({ error: 'House not found' });
    }
    console.log("Provided houseId: ", houseId)
    await deleteHouse(houseId);
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/house-members', async (req, res) => {
  try {
    const { houseName } = req.body;
    const token = req.cookies['session-cookie'];
    
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const isValid = await checkSessionExists(token);
    if (!isValid) {
      res.clearCookie('session-cookie');
      return res.status(401).json({ error: 'Invalid session' });
    }

    const houseId = await findHouseFromName(houseName);
    if (!houseId) {
      return res.status(404).json({ error: 'House not found' });
    }

    const userIds = await findUsersInHouse(houseId);
    const members = await Promise.all(
      userIds.map(async (userId) => {
        const user = await getUserById(userId);
        return user.username;
      })
    );

    console.log("Members:", members);

    res.json({ members });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('session-cookie');
  res.status(200).json({ message: 'Logged out successfully' });
});

//Join Request 

app.post('/api/join-house', async (req, res) => {
  try{
    const { houseName, adminEmail } = req.body;
    const token = req.cookies['session-cookie'];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });
      
      const isValid = await checkSessionExists(token);
      if (!isValid) {
        res.clearCookie('session-cookie');
        return res.status(401).json({ message: 'Invalid session' });
      }

    const userId = await findUserFromSession(token);

    const houseId = await findHouseFromName(houseName);
    if (!houseId) {
      return res.status(404).json({ message: 'One or more fields are incorrect' });
    }

    const house = await findHouseDetails(houseId);

    const adminUser = await findUserByEmail(adminEmail);

    if (!adminUser || adminUser._id.toString() !== house.creatorUserId.toString()) {
      return res.status(403).json({ message: 'One or more fields are incorrect' });
    }

    const requestResult = await createJoinRequest(houseId, userId);

    console.log(`Request result for join request for user ${userId} for house ${houseId}: `, requestResult)

    res.json({
      success: true,
      message: 'Join request submitted'
    });

  } catch (error) {
    console.error('Join house error:', error);
    res.status(500).json({
      message: "Failed to process join request"
    });
  }
});

app.get('/api/current-user', async (req, res) => {
  try {
    const token = req.cookies['session-cookie'];
    if (!token) return res.status(401).send('Unauthorized');

    const isValid = await checkSessionExists(token);
    if (!isValid) {
      res.clearCookie('session-cookie');
      return res.status(401).send('Invalid session');
    }

    const userId = await findUserFromSession(token);
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ username: user.username });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/house-info', async (req, res) => {
  try {
    const token = req.cookies['session-cookie'];
    const { houseName } = req.query;

    if (!token) return res.status(401).send('Unauthorized');
    if (!houseName) return res.status(400).json({ message: 'House name is required' });

    const isValid = await checkSessionExists(token);
    if (!isValid) {
      res.clearCookie('session-cookie');
      return res.status(401).send('Invalid session');
    }

    const currentUserId = await findUserFromSession(token);
    const creatorUserId = await getHouseCreatorId(houseName);

    if (!creatorUserId) {
      return res.status(404).json({ message: 'House not found' });
    }

    // Instead of sending back the creator ID, just send whether the current user is the creator
    const isCreator = currentUserId.toString() === creatorUserId.toString();
    res.status(200).json({ isCreator });
  } catch (error) {
    console.error('Error getting house info:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/join-requests', async (req, res) => {
  try {
    const token = req.cookies['session-cookie'];
    const { houseName } = req.query;

    if (!token) return res.status(401).send('Unauthorized');
    if (!houseName) return res.status(400).json({ message: 'House name is required' });

    const isValid = await checkSessionExists(token);
    if (!isValid) {
      res.clearCookie('session-cookie');
      return res.status(401).send('Invalid session');
    }

    const currentUserId = await findUserFromSession(token);
    const creatorUserId = await getHouseCreatorId(houseName);

    if (currentUserId.toString() !== creatorUserId.toString()) {
      return res.status(403).json({ message: 'Only house creator can view join requests' });
    }

    const requests = await getJoinRequests(houseName);
    res.status(200).json({ requests: requests.map(r => r.username) });
  } catch (error) {
    console.error('Error getting join requests:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/handle-request', async (req, res) => {
  try {
    const token = req.cookies['session-cookie'];
    const { houseName, requesterUsername, action } = req.body;

    if (!token) return res.status(401).send('Unauthorized');
    if (!houseName || !requesterUsername || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const isValid = await checkSessionExists(token);
    if (!isValid) {
      res.clearCookie('session-cookie');
      return res.status(401).send('Invalid session');
    }

    const currentUserId = await findUserFromSession(token);
    const creatorUserId = await getHouseCreatorId(houseName);

    if (currentUserId.toString() !== creatorUserId.toString()) {
      return res.status(403).json({ message: 'Only house creator can handle join requests' });
    }

    await handleJoinRequest(houseName, requesterUsername, action);
    res.status(200).json({ message: `Request ${action}ed successfully` });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ message: error.message });
  }
});