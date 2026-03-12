import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const MONGO_URI = process.env.MONGODB_URI;

async function listAll() {
    try {
        const client = await mongoose.connect(MONGO_URI);
        const admin = mongoose.connection.client.db().admin();
        const dbs = await admin.listDatabases();
        console.log("Databases:", dbs.databases.map(db => db.name));
        
        // Check current db
        const currentDb = mongoose.connection.name;
        console.log("Current DB:", currentDb);
        const cols = await mongoose.connection.db.listCollections().toArray();
        console.log(`Collections in ${currentDb}:`, cols.map(c => c.name));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listAll();
