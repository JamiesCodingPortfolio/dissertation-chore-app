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

//House DB function

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

        console.log("houseIdInput:", result?.houseName);

        if (result?.houseName === null){
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

        const checkChores = [
        { $match: { houseId: houseId } },
        { 
            $group: {
            _id: '$assignedUserId',
            count: { $sum: 1 }
            }
        }
        ];

        const result = await chores.aggregate(checkChores).toArray();

        console.log("Result:", result)

        const counts = {};
        for (const doc of result) {
            counts[doc._id.toString()] = doc.count;
        }

        const entries = Object.entries(counts);

        if (entries.length <= 1) {
            console.log('Users assigned to chores.', entries.length);
            const userIds = await findUsersInHouse(houseId);

            const randomIndex = Math.floor(Math.random() * userIds.length);
            const randomUserId = userIds[randomIndex];
            console.log(randomUserId);

            return randomUserId;
        }
        else {
            const minCount = Math.min(...entries.map(([, count]) => count));

            const usersWithMin = entries
            .filter(([, count]) => count === minCount)
            .map(([userId]) => userId);

            if (usersWithMin.length > 1){
                const randomIndex = Math.floor(Math.random() * userIds.length);
                const randomUserId = usersWithMin[randomIndex];
                console.log(randomUserId);
            }
        }

        console.log(counts); 

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