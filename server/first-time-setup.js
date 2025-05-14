import { connectDB } from './database/database-connections.js';
import mongoose from 'mongoose';

export const updateUserValidationSchema = async () => {
  try {
    if (!mongoose.connection?.db) {
      await connectDB();
    }

    const db = mongoose.connection.db;
    
    // Define the JSON schema validation
    const validator = {
      $jsonSchema: {
        bsonType: 'object',
        required: [
          '_id',
          'userId',
          'createdOn'
        ],
        properties: {
          _id: {
            bsonType: 'objectId'
          },
          UserID: {
            bsonType: 'objectId'
          },
          createdOn: {
            bsonType: 'date'
          }
        }
      }
    };

    // Update the collection with the new validation schema
    const result = await db.command({
      collMod: "Sessions",
      validator: validator,
      validationLevel: "strict", // Options: off, moderate, strict
      validationAction: "error" // Options: warn, error
    });

    console.log("Successfully updated validation schema:", result);
    return true;

  } catch (error) {
    console.error("Error updating validation schema:", error);

    if (error.codeName === 'NamespaceNotFound') {
      console.log('Creating Users collection with validation schema...');
      await mongoose.connection.createCollection('Users', { validator });
      return true;
    }
    
    throw error;
  }
};


const runMigration = async () => {
    try {
      await updateUserValidationSchema();
      console.log('Migration completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  };
  
  runMigration();