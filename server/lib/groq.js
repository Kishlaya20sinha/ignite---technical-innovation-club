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
        
        CRITICAL ACCURACY REQUIREMENT: 
        You must ensure the 'correctAnswer' index strictly matches the mathematically and factually correct option in the 'options' array. 
        You MUST verify this by writing step-by-step reasoning BEFORE outputting the correctAnswer index.
        
        IMPORTANT: ALL ${batchCount} questions MUST be "${difficulty}" difficulty. Do NOT mix difficulties.
        
        Format your response as a JSON Object with a single key "questions" containing an array of objects.
        Each object must have exactly these keys:
        - "question": string (The question text itself)
        - "type": "mcq" (always "mcq")
        - "options": array of exactly 4 strings (e.g. ["A", "B", "C", "D"])
        - "reasoning": string (Verify factually why the correct answer is right and which option exactly it matches)
        - "correctAnswer": number (Must be the exact integer index 0, 1, 2, or 3 of the correct option)
        - "difficulty": "${difficulty}"
        
        Return ONLY a valid JSON object.
        `;

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: `You are an expert technical exam setter. Your highest priority is 100% FACTUAL ACCURACY. You must write out your reasoning to verify the correctAnswer index perfectly matches the true answer string in the options array.` },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                temperature: 0.3, // Extremely low temperature for analytical accuracy
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
