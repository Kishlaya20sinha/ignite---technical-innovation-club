import mongoose from 'mongoose';
import ExamQuestion from '../server/models/ExamQuestion.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const MONGO_URI = process.env.MONGODB_URI;

async function updateQuestions() {
    try {
        console.log("Connecting to test db...");
        await mongoose.connect(MONGO_URI, { dbName: 'test' });
        console.log("Connected to:", mongoose.connection.name);

        const allQuestions = await ExamQuestion.find().sort({ createdAt: 1 });
        console.log(`Found ${allQuestions.length} questions`);

        if (allQuestions.length === 0) {
            console.log("No questions found in 'test' db.");
            process.exit(0);
        }

        console.log("Updating categories...");
        for (let i = 0; i < allQuestions.length; i++) {
            const category = (i < 100) ? 'coding' : 'aptitude';
            await ExamQuestion.updateOne({ _id: allQuestions[i]._id }, { category });
        }
        
        console.log(`Successfully updated ${allQuestions.length} questions.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateQuestions();
