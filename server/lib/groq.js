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
    Generate ${count} unique technical aptitude questions for a university technical club recruitment exam.
    Domain: ${domain} (General Aptitude, Coding Logic, Basic Electronics, etc. mix).
    
    Format: JSON Array of objects.
    Each object must have:
    - "question": string
    - "type": "mcq" or "input" (mix them, mostly mcq)
    - "options": array of 4 strings (only for mcq, empty for input)
    - "correctAnswer": number (index 0-3 for mcq) or string key (for input)
    
    For "input" type, make the question a short conceptual answer or code output request.
    
    Ensure questions are challenging but solvable by undergraduates.
    Return ONLY the valid JSON array, no markdown.
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are an exam question generator JSON API." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0]?.message?.content || '[]';
        // Clean markdown if present
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Groq generation error:', error);
        return [];
    }
};
