import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const MONGO_URI = process.env.MONGODB_URI;

async function run() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        console.log("Native Connected");
        const db = client.db('test');
        const col = db.collection('examquestions');

        const allQuestions = await col.find({}).sort({ createdAt: 1 }).toArray();
        console.log(`Found ${allQuestions.length} questions`);

        let updated = 0;
        for (let i = 0; i < allQuestions.length; i++) {
            const category = (i < 100) ? 'coding' : 'aptitude';
            await col.updateOne({ _id: allQuestions[i]._id }, { $set: { category } });
            updated++;
        }
        
        console.log(`Successfully updated ${updated} questions natively.`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        process.exit(0);
    }
}

run();
