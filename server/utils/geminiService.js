import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_GENAI_API_KEY;
// Note: Use gemini-1.5-flash for maximum stability on the v1 endpoint
const BASE_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

const callGeminiRest = async (prompt) => {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(`Gemini API Error: ${data.error.message}`);
    }

    if (!data.candidates || !data.candidates[0].content.parts[0].text) {
        throw new Error("Gemini returned an empty response.");
    }

    return data.candidates[0].content.parts[0].text;
};

const safeParseJSON = (text) => {
    try {
        const cleaned = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error. Raw text was:", text);
        return null;
    }
};

export const generateFlashcardsAI = async (text, count = 10) => {
    try {
        const prompt = `Generate ${count} flashcards from the text below.
        Return ONLY a JSON array. 
        Format: [{"question": "...", "answer": "...", "difficulty": "easy"}]
        Text: ${text.substring(0, 12000)}`;

        const rawResponse = await callGeminiRest(prompt);
        return safeParseJSON(rawResponse) || [];
    } catch (error) {
        console.error("Flashcard Logic Error:", error);
        return [];
    }
};

export const generateQuizAI = async (text, numQuestions = 5) => {
    try {
        const prompt = `Generate ${numQuestions} multiple choice questions.
        Output ONLY a JSON array of objects with keys: "question", "options" (array of 4), "correctAnswer" (string), "explanation", "difficulty".
        Text: ${text.substring(0, 12000)}`;

        const rawResponse = await callGeminiRest(prompt);
        return safeParseJSON(rawResponse) || [];
    } catch (error) {
        console.error("Quiz Error:", error);
        return [];
    }
};

export const generateSummaryAI = async (text) => {
    try {
        const prompt = `Summarize this text in a structured way with bullet points: ${text.substring(0, 15000)}`;
        return await callGeminiRest(prompt);
    } catch (error) {
        return "Summary generation failed.";
    }
};

export const explainConceptAI = async (concept, context) => {
    try {
        const prompt = `Explain the concept "${concept}" simply using this context: ${context.substring(0, 10000)}`;
        return await callGeminiRest(prompt);
    } catch (error) {
        return "Explanation failed.";
    }
};

export const chatWithContextAI = async (question, chunks) => {
    try {
        const contextText = chunks.map((c, i) => `[Ref ${i+1}]: ${c.content}`).join("\n\n");
        const prompt = `You are an AI study assistant. Answer strictly using the context. 
        If not found, say "I don't have enough information."
        Context: ${contextText}\n\nQuestion: ${question}`;
        return await callGeminiRest(prompt);
    } catch (error) {
        console.error("Chat Context Error:", error);
        return "I encountered an error while processing your question.";
    }
};