import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

import { hashTokens } from '../auth/hashToken.js'
import { hashPassword } from '../auth/passwordHasher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



dotenv.config({ path: join(__dirname, '../../.env') });

export const connectDB = async () => {
    console.log("Connecting to database");
    try {
        await mongoose.connect(process.env.DB_KEY, {
        });
        console.log('MongoDB Connected');
        console.log(`Collections: ${(await mongoose.connection.db.listCollections().toArray()).map(c => c.name)}`);
    } 
    catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

export const checkEmailExists = async (email) => {
    console.log("Running function checkEmailExists");
    try {
        if (typeof email !== 'string' || email.trim() === '') {
            throw new Error('Invalid email input');
        }

        const lowercaseEmail = email.toLowerCase().trim();
        
        if (!mongoose.connection?.db) {
            await connectDB();
        }

        const users = mongoose.connection.db.collection('Users');
        const existingUser = await users.findOne(
            { email: lowercaseEmail },
            { projection: { _id: 1 } }
        );

        console.log(existingUser)
        return !!existingUser;
    } 
    catch (error) {
        console.error('Email check error:', error);
        throw new Error('Error checking email availability');
    }
};

export const addNewUser = async (name, email, hashedPassword, salt) => {
    console.log("Running function addNewUser");
    try {

        if (typeof name !== 'string'){
            throw new Error('Invalid name input')
        }
        if (typeof email !== 'string' || email.trim() === '') {
            throw new Error('Invalid email input');
        }

        if (typeof hashedPassword !== 'string' || hashedPassword === '') {
            throw new Error('Invalid password hash');
        }

        if (typeof salt !== 'string' || salt === '') {
            throw new Error('Invalid salt value');
        }

        const lowercaseEmail = email.toLowerCase().trim();

        let emailExists;

        emailExists = await checkEmailExists(lowercaseEmail);
        if (emailExists === true) {
            throw new Error('Email already registered');
        }
        else {
            emailExists = false;
        }

        if (!mongoose.connection?.db) {
            await connectDB();
        }

        const users = mongoose.connection.db.collection('Users');
        
        const result = await users.insertOne({
            username: name.trim(),
            email: lowercaseEmail,
            hashedPassword,
            salt
        });

        if (!result.acknowledged) {
            throw new Error('Failed to create user');
        }

        console.log('User added with ID:', result.insertedId);
        return result.insertedId;

    } catch (error) {
        console.error('Error adding new user:', error);
        throw error;
    }
}

export const getUserById = async (userId) => {
    console.log("Running function getUserById");
    try {
    if (!mongoose.connection?.db) {
        await connectDB();
    }

    console.log(userId)

    const userIdObj = new mongoose.Types.ObjectId(`${userId}`)

    const users = mongoose.connection.db.collection('Users');
    const user = await users.findOne(
        { _id: userIdObj },
        { projection: { username: 1 } }
    );

    return user;
    } catch (error) {
    console.error('Error fetching user:', error);
    return null;
    }
};

export const findUserByEmail = async (email) => {
    console.log("Running function findUserByEmail");
    try {
        const users = mongoose.connection.db.collection('Users');
        return await users.findOne({ 
            email: email.toLowerCase().trim() 
    });
    } catch (error) {
        console.error('Error finding user by email:', error);
        return null;
    }
};

//Login/Session functions

export const createNewSession = async (userId) => {
    console.log("Running function createNewSession");
    try {
        if (!mongoose.connection?.db) {
            await connectDB();
        }

        const sessions = mongoose.connection.db.collection('Sessions');
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashTokens(token);

        const userIdSes = new mongoose.Types.ObjectId(`${userId}`) // Removes depreciation warning

        const result = await sessions.insertOne({
            userId: userIdSes,
            tokenHash,
            createdOn: new Date()
        });

        console.log("Session created for user:", userIdSes);
        console.log("Session document ID:", result.insertedId);
        return token;

    } catch (error) {
        console.error('Session creation error:', error);
        throw new Error('Failed to create session');
    }
}

export const checkSessionExists = async (token) => {
    console.log("Running function checkSessionExists");
    try {
        if (!mongoose.connection?.db) {
            await connectDB();
        }

        const tokenHash = hashTokens(token);

        const sessions = mongoose.connection.db.collection('Sessions');
        const session = await sessions.findOne({ 
            tokenHash
        });

        return session !== null;

    } catch (error) {
        console.error('Session validation error:', error);
        throw new Error('Failed to verify session');
    }
}

export const findUserFromSession = async (token) => {
    console.log("Running function findUserFromSession");
    try {
        if (!mongoose.connection?.db) {
            await connectDB();
        }

        const tokenHash = hashTokens(token);

        const sessions = mongoose.connection.db.collection('Sessions');
            const session = await sessions.findOne({ 
            tokenHash
        });

        return session.userId;

    } catch (error) {
        console.error('Session validation error:', error);
        throw new Error('Failed to verify session');
    }
}

export const checkLoginValidity = async (userEmail, password) => {
    console.log("Running function checkLoginValidity");
    try{
        if (!mongoose.connection?.db) {
            await connectDB();
        }

        if (typeof userEmail !== 'string' || userEmail.trim() === '') {
                throw new Error('Invalid email input');
        }

        const users = mongoose.connection.db.collection('Users');
        const result = await users.findOne({
            email: userEmail.trim()
        });

        if (!result) {
            throw new Error('User not found');
        }

        if (!result.hashedPassword || !result.salt) {
                throw new Error('Invalid user record');
        }

        if (result.email === userEmail.trim()) {
            console.log('User found');
        }

        const inputHash = await hashPassword(
            password, 
            result.salt.normalize()
        );

        const isValid = crypto.timingSafeEqual(
            Buffer.from(inputHash, 'hex'),
            Buffer.from(result.hashedPassword.normalize(), 'hex')
        );

        if (isValid) {
            return result._id;
        } else {
            throw new Error ("Email or password is incorrect")
}
    } catch (error) {
        console.error('Login validation error:', error);
        throw new Error(error);
    }
}

//House DB functions

export const userInAnyHouseCheck = async (userId) => {
    console.log("Running function userInAnyHouseCheck");
    try {
        if (!mongoose.connection?.db) {
            await connectDB();
        }

        const userIdInput = userId;

        const users = mongoose.connection.db.collection('Users');
        const result = await users.findOne(
            { _id: userIdInput },
            { projection: { houseIds: 1 } 
        });

        console.log(result.houseIds);

        if (!result || !result.houseIds) {
            return [];
        }

        return result.houseIds.map(id => id);

    } catch (error) {
        throw new Error ("Error:", error);
    }
}

export const findHouse = async (houseId) => {
    console.log("Running function findHouse");
    try {
        if (!mongoose.connection?.db) {
            await connectDB();
        }

        const houses = mongoose.connection.db.collection('Houses');

        const houseIdInput = new mongoose.Types.ObjectId(`${houseId}`);

        console.log("houseIdInput:", houseIdInput)

        const result = await houses.findOne(
            { _id: houseIdInput },
            { projection: { _id: 1, houseName: 1 } }
        );

        console.log("houseIdInput:", result?.houseName);

        if (result?.houseName === null){
            return null;
        }
        return result?.houseName;

    } catch (error) {
        console.error('Error finding house:', error);
        return null;
    }
}

export const findHouseFromName = async (houseName) => {
    console.log("Running function findHouseFromName");
    try {
        if (!mongoose.connection?.db) {
            await connectDB();
        }

        const houses = mongoose.connection.db.collection('Houses');
        

        console.log("House Name Provided:", houseName)

        const result = await houses.findOne(
            { houseName },
            { projection: { _id: 1 } }
        );

        if (!result) {
            return null;
        }

        return result?._id;

    } catch (error) {
        console.error('Error finding house:', error);
        return null;
    }
}

export const findUsersInHouse = async (houseId) => {
    console.log("Running function findUsersInHouse");
    try {
        if (!mongoose.connection?.db) {
            await connectDB();
        }

        const houses = mongoose.connection.db.collection('Houses');

        const houseIdInput = new mongoose.Types.ObjectId(`${houseId}`);

        console.log("houseIdInput:", houseIdInput)

        const result = await houses.findOne(
            { _id: houseIdInput },
            { projection: { userIds: 1 } }
        );

        console.log("Result:", result?.userIds);

        if (result?.userIds === null){
            return null;
        }
        return result?.userIds.map((oid) => oid.toString());

    } catch (error) {
        console.error('Error finding users in house:', error);
        return null;
    }
}


export const newHouse = async (userId, houseName, maxHouseholdMembers) => {
    console.log("Running function newHouse");
    try {
        if (!mongoose.connection?.db) {
            await connectDB();
        }
        if (!houseName?.trim()) {
            throw new Error('House name is required');
        }
        if (!Number.isInteger(maxHouseholdMembers) || maxHouseholdMembers <= 0) {
            throw new Error('Invalid maximum household members value');
        }

        const houses = mongoose.connection.db.collection('Houses');
        const users = mongoose.connection.db.collection('Users');

        const creatorId = new mongoose.Types.ObjectId(`${userId}`);

        const newHouse = {
            creatorUserId: creatorId,
            houseName: houseName,
            userIds: [(creatorId)],
            maxHouseholdMembers
        }

        const houseResult = await houses.insertOne(newHouse);

        const updateUser = await users.updateOne(
            { _id: creatorId },
            { $addToSet: { houseIds: houseResult.insertedId } }
        );
        console.log(newHouse);
        
        return;

    } catch (error) {
        console.error('Error creating new house:', error);
        throw new Error(error.message);
    }
}

export const modifyHouseName = async (houseId, newHouseName) => {
    console.log("Running function modifyHouseName");
    try {
        if (!mongoose.connection?.db) {
            await connectDB();
        }
        if (typeof newHouseName !== 'string' || newHouseName.trim() === '') {
            throw new Error('New house name must be a string');
        }

        const houses = mongoose.connection.db.collection('Houses');
        
        console.log("Modifying houseId: ", houseId);
        
        const result = await houses.updateOne(
            { _id: houseId },
            { $set: { houseName: newHouseName } }
        );

        return result.modifiedCount === 1;
        
    } catch (error) {
        console.error('Error modifying house:', error);
        throw new Error(error.message);
    }
}

export const deleteHouse = async (houseId) => {
  console.log("Running function deleteHouse");
  try {
    if (!mongoose.connection?.db) {
      await connectDB();
    }

    const db = mongoose.connection.db;

    const houses = db.collection('Houses');
    const houseDeleteResult = await houses.deleteOne({ _id: houseId });
    
    if (houseDeleteResult.deletedCount === 0) {
      throw new Error('House not found');
    }

    const users = db.collection('Users');
    await users.updateMany(
      { houseIds: houseId },
      { $pull: { houseIds: houseId } }
    );

    // 3. Delete associated chores last
    const chores = db.collection('Chore');
    await chores.deleteMany({ houseId: houseId });

    return true;
  } catch (error) {
    console.error('Error deleting house:', error);
    throw new Error(error.message);
  }
};

export const findHouseDetails = async (houseId) => {
    console.log("Running function findHouseDetails");
    try {
        const houses = mongoose.connection.db.collection('Houses');
        return await houses.findOne({ _id: houseId });
    } catch (error) {
        console.error('Error finding house details:', error);
        return null;
    }
};

//Chore Database Logic

export const newChore = async (choreName, choreDescription, houseName, userId) => {
    console.log("Running function newChore");
    try {
        if (!mongoose.connection?.db) {
            await connectDB();
        }
        if (!choreName?.trim()) {
            throw new Error('Chore name is required');
        }
        if (!choreDescription?.trim()) {
            throw new Error('Chore Description is required');
        }
        
        const houseId = await findHouseFromName(houseName);

        console.log(houseId);

        if (!houseId){
            throw new Error('Could not find house provided')
        }
        
        const chores = mongoose.connection.db.collection('Chore');

        const assignedUserId = await distributeChores(houseId)

        console.log("Assigned User Id", assignedUserId)

        const newChore = {
            name: choreName,
            description: choreDescription,
            houseId: houseId,
            assignedUserId: assignedUserId,
            createdBy: userId
        }

        const choreResult = await chores.insertOne(newChore);

        console.log(choreResult);
        
        return;

    } catch (error) {
        console.error('Error creating new chore:', error);
        throw new Error(error.message);
    }
}

export const distributeChores = async (houseId) =>{
    console.log("Running function distributeChores");
    try {

        if (!mongoose.connection?.db) {
            await connectDB();
        }
        
        const chores = mongoose.connection.db.collection('Chore');

        const userIds = await findUsersInHouse(houseId); 

        const checkChores = [
            { $match: { houseId, assignedUserId: { $in: userIds } } },
            { $group: { _id: '$assignedUserId', count: { $sum: 1 } } }
        ];

        const result = await chores.aggregate(checkChores).toArray();

        const counts = userIds.reduce((map, userId) => {
            map[userId] = 0;
            return map;
        }, {});
        
        for (const { _id, count } of result) {
            counts[_id] = count;
        }

        const entries = Object.entries(counts); 

        const minCount = Math.min(...entries.map(([, countValue]) => countValue));

        const candidates = entries
        .filter(([, countValue]) => countValue === minCount)
        .map(([userId]) => userId);

        const selectedUserId =
        candidates.length === 1
            ? candidates[0]
            : candidates[Math.floor(Math.random() * candidates.length)];

        console.log('Assigning to user:', selectedUserId);
        return selectedUserId;

    } catch (error) {
        console.error('Error creating distributing chores:', error);
    }
}

export const findChoresAssignedToUser = async (userId) => {
    console.log("Running function findChoresAssignedToUser userId: ", userId);
    try {
        if (!mongoose.connection?.db) {
            await connectDB();
        }
        
        const chores = mongoose.connection.db.collection('Chore');

        const userIdString = userId.toString();

        const pipeline = [
            { 
                $match: { 
                    assignedUserId: userIdString
                } 
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    description: 1
                }
            }
        ];

        const result = await chores.aggregate(pipeline).toArray();
        console.log(result);
        return result;

    } catch (error) {
        console.error('Error fetching user chores:', error);
        return []; // Return empty array on error
    }
}

//Join house requests

export const createJoinRequest = async (houseId, userId) => {
  try {
    if (!mongoose.connection?.db) await connectDB();
    
    const joinRequests = mongoose.connection.db.collection('JoinRequests');
    
    // Check for existing pending request
    const existingRequest = await joinRequests.findOne({
      houseId,
      userId,
      status: 'pending'
    });

    if (existingRequest) {
      throw new Error('Pending request already exists');
    }

    // Create new request document
    const requestDoc = {
      houseId,
      userId,
      status: 'pending',
      requestedAt: new Date(),
    };

    const result = await joinRequests.insertOne(requestDoc);
    
    return {
      insertedId: result.insertedId,
      houseId: houseId,
      userId: userId
    };

  } catch (error) {
    console.error('Join request creation failed:', error);
    throw error;
  }
};