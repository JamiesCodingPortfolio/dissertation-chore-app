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

const checkUsernameInUse = async (username) => {
    try {
        const users = mongoose.connection.db.collection('users');
        const existingUser = await users.findOne(
            { username: { $regex: `^${username}$`, $options: 'i' } },
            { projection: { _id: 1 } }
        );
        return !!existingUser;
    } 
    catch (error) {
        console.log('Username error:', error);
        throw new Error('Error cehcking username availability');
    }
};

export { connectDB, checkUsernameInUse };
export default connectDB;