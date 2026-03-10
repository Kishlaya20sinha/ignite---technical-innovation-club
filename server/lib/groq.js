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

    // Split count into 5:8:7 ratio (easy:medium:hard)
    const totalRatio = 5 + 8 + 7; // 20
    const easyCount = Math.max(1, Math.round(count * 5 / totalRatio));
    const hardCount = Math.max(1, Math.round(count * 7 / totalRatio));
    const medCount = Math.max(1, count - easyCount - hardCount); // remainder goes to medium

    const generateBatch = async (difficulty, batchCount) => {
        const difficultyGuide = {
            easy: 'Simple, straightforward questions. Basic concepts, definitions, and direct recall. A first-year student should answer these correctly.',
            medium: 'Moderate difficulty. Requires understanding of concepts, some application and reasoning. Average students may need to think carefully.',
            hard: 'Challenging questions. Requires deep understanding, multi-step reasoning, tricky edge cases, or advanced topics. Only strong students will answer correctly.'
        };

        const prompt = `
        Generate exactly ${batchCount} ${difficulty.toUpperCase()} difficulty Multiple Choice Questions (MCQs) for a technical recruitment exam.
        Domain: ${domain} (Aptitude, Coding, CS Fundamentals).
        
        DIFFICULTY: ${difficulty.toUpperCase()}
        ${difficultyGuide[difficulty]}
        
        IMPORTANT: ALL ${batchCount} questions MUST be "${difficulty}" difficulty. Do NOT mix difficulties.
        
        Format: JSON Array of objects.
        Each object must have:
        - "question": string
        - "type": "mcq" (always "mcq")
        - "options": array of exactly 4 strings
        - "correctAnswer": number (index 0-3)
        - "difficulty": "${difficulty}" (MUST be "${difficulty}" for every question)
        
        Return ONLY valid JSON.
        `;

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: `You are a recruitment exam MCQ generator. You ONLY generate ${difficulty} difficulty questions. Output only valid JSON arrays.` },
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
                difficulty: difficulty // Force the difficulty we requested
            }));
        } catch (error) {
            console.error(`Groq generation error for ${difficulty}:`, error);
            return [];
        }
    };

    // Generate all 3 batches in parallel
    const [easyQs, medQs, hardQs] = await Promise.all([
        generateBatch('easy', easyCount),
        generateBatch('medium', medCount),
        generateBatch('hard', hardCount)
    ]);

    console.log(`AI Generated: ${easyQs.length} easy, ${medQs.length} medium, ${hardQs.length} hard`);
    return [...easyQs, ...medQs, ...hardQs];
};
