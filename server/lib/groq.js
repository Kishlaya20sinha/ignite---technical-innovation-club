import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

let groq;
if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export const generateExamQuestions = async (domain = 'General', count = 10) => {
    if (!groq) {
        console.warn('GROQ_API_KEY not found. Returning empty array.');
        return [];
    }

    const prompt = `
    Generate ${count} unique Multiple Choice Questions (MCQs) for a technical recruitment exam.
    Domain: ${domain} (Aptitude, Coding, CS Fundamentals).
    
    Difficulty Request: ${domain === 'General' ? 'Mixed' : domain}
    
    Format: JSON Array of objects.
    Each object must have:
    - "question": string
    - "type": "mcq" (always "mcq")
    - "options": array of exactly 4 strings
    - "correctAnswer": number (index 0-3)
    - "difficulty": "easy", "medium", or "hard"
    
    Return ONLY valid JSON.
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a recruitment exam MCQ generator. Output only valid JSON arrays." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0]?.message?.content || '[]';
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);

        let questions = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);
        
        return questions.map(q => ({
            question: q.question,
            type: 'mcq',
            options: Array.isArray(q.options) ? q.options.slice(0, 4) : ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: (typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4) 
                ? q.correctAnswer 
                : 0,
            difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty?.toLowerCase()) ? q.difficulty.toLowerCase() : 'medium'
        }));
    } catch (error) {
        console.error('Groq generation error:', error);
        return [];
    }
};
