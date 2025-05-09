import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

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

export { connectDB, checkEmailExists };
export default connectDB;