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
    
    For "input" type, the question must be answerable with a SINGLE word, number, or short character sequence.
    - Do NOT ask for full code implementations.
    - Ask for output of a snippet, time complexity, or a specific keyword.
    - The "correctAnswer" field for input type must be SHORT (e.g. "O(n)", "15", "stack", "2.5").
    
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
        const parsed = JSON.parse(jsonStr);

        let questions = [];
        if (Array.isArray(parsed)) questions = parsed;
        else if (parsed && Array.isArray(parsed.questions)) questions = parsed.questions;
        else if (parsed && Array.isArray(parsed.data)) questions = parsed.data;
        else {
            console.warn('Groq returned non-array:', parsed);
            return [];
        }

        // Sanitize questions
        return questions.map(q => {
             // Validate and normalize type
             if (q.type) q.type = q.type.toLowerCase();
             
             // Ensure options is an array
             if (!Array.isArray(q.options)) q.options = [];
             
             // Auto-detect type: if no options, it must be input
             if (q.options.length === 0) q.type = 'input';
             if (q.type) q.type = q.type.toLowerCase();
             // Fix correctAnswer if it's a string (e.g. "a", "A" -> 0)
             if (q.type === 'mcq') {
                 let originalAnswer = q.correctAnswer;
                 if (typeof q.correctAnswer === 'string') {
                     const lower = q.correctAnswer.toLowerCase();
                     if (lower === 'a') q.correctAnswer = 0;
                     else if (lower === 'b') q.correctAnswer = 1;
                     else if (lower === 'c') q.correctAnswer = 2;
                     else if (lower === 'd') q.correctAnswer = 3;
                     else q.correctAnswer = parseInt(q.correctAnswer) || 0;
                 }
                 // Ensure it is a number. If undefined/null, make it check options or default
                 if (q.correctAnswer === undefined || q.correctAnswer === null || isNaN(q.correctAnswer)) {
                     // Try to match the answer string against options if it was a string
                     const matchIdx = q.options.findIndex(opt => opt.toString().toLowerCase() === String(originalAnswer).toLowerCase());
                     q.correctAnswer = matchIdx !== -1 ? matchIdx : 0;
                 } else {
                     // It is a number, but check bounds
                     if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
                         // Case: 1-based indexing (e.g. 1-4 instead of 0-3)
                         if (q.correctAnswer > 0 && q.correctAnswer <= q.options.length) {
                             q.correctAnswer -= 1;
                         } else {
                             // Case: Answer is the value (number) itself, not index
                             const matchIdx = q.options.findIndex(opt => opt.includes(String(q.correctAnswer)));
                             q.correctAnswer = matchIdx !== -1 ? matchIdx : 0;
                         }
                     }
                 }
             } else {
                 // For input type, handle various AI return formats
                 if (!q.correctAnswer) {
                     q.correctAnswer = q.answer || q.key || q.output || "Answer Key";
                 }
                 // Ensure it's a string for display consistency
                 q.correctAnswer = String(q.correctAnswer);
             }
             return q;
        });
    } catch (error) {
        console.error('Groq generation error:', error);
        return [];
    }
};
