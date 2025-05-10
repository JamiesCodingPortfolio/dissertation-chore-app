import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

import { hashTokens } from '../auth/hashToken.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const connectDB = async () => {
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

const checkEmailExists = async (email) => {
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

const addNewUser = async (name, email, hashedPassword, salt) => {
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

const createNewSession = async (userId) => {
    try {
        if (!mongoose.connection?.db) {
            await connectDB();
        }

        const sessions = mongoose.connection.db.collection('Sessions');
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashTokens(token);

        const userIdSes = new mongoose.Types.ObjectId(userId)

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

export { createNewSession, addNewUser, connectDB, checkEmailExists };