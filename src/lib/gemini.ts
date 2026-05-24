import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

console.log("Loaded Gemini Key:", apiKey ? "YES" : "NO");

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("VITE_GEMINI_API_KEY is missing. Gemini features will not work.");
}

function getAI() {
  if (!ai) {
    throw new Error(
      "Gemini API key missing. Add VITE_GEMINI_API_KEY in frontend/.env and restart npm run dev."
    );
  }
  return ai;
}

export const MODELS = {
  text: "gemini-2.5-flash",
  pro: "gemini-2.5-flash",
};

export async function generateLesson(topic: string, notes: string) {
  const ai = getAI();

  const prompt = `Generate a structured lesson based on the following topic and notes:
Topic: ${topic}
Notes: ${notes}

Return only valid JSON:
{
  "title": "string",
  "summary": "string",
  "explanation": "string",
  "keyPoints": ["string"],
  "examples": ["string"],
  "examNotes": "string"
}`;

  const response = await ai.models.generateContent({
    model: MODELS.text,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          explanation: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          examples: { type: Type.ARRAY, items: { type: Type.STRING } },
          examNotes: { type: Type.STRING },
        },
        required: ["title", "summary", "explanation", "keyPoints", "examples", "examNotes"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateQuiz(lessonContent: string) {
  const ai = getAI();

  const prompt = `Based on this lesson content, generate 5 multiple-choice questions:
Lesson: ${lessonContent}

Return only valid JSON array:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": "string",
    "explanation": "string",
    "difficulty": "easy | medium | hard"
  }
]`;

  const response = await ai.models.generateContent({
    model: MODELS.text,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.STRING },
          },
          required: ["question", "options", "correctAnswer", "explanation", "difficulty"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
}

export async function generateStudyPlan(goal: string) {
  const ai = getAI();

  const prompt = `Create a 7-day study plan to achieve this goal: ${goal}

Return only valid JSON:
{
  "goal": "string",
  "schedule": [
    {
      "day": "Day 1 - Introduction",
      "tasks": ["string"]
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: MODELS.text,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          goal: { type: Type.STRING },
          schedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["day", "tasks"],
            },
          },
        },
        required: ["goal", "schedule"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function chatExplanation(history: any[], query: string) {
  const ai = getAI();

  const chat = ai.chats.create({
    model: MODELS.text,
    config: {
      systemInstruction:
        "You are EduMind AI, a friendly and intelligent tutor. Explain complex topics simply and encouragingly. Use markdown formatting.",
    },
    history,
  });

  const result = await chat.sendMessage({ message: query });
  return result.text;
}

export async function generateFlashcardsAndQuiz(content: string) {
  const ai = getAI();

  const prompt = `You are an expert teacher. Analyze the study material below and generate:
1. 10 flashcards
2. 10 multiple choice questions with answers and explanations

Study Material:
${content}

Return only valid JSON:
{
  "flashcards": [
    { "front": "question or concept", "back": "answer or explanation" }
  ],
  "quiz": [
    {
      "question": "question text",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "correctAnswer": "the correct option string",
      "explanation": "why it is correct",
      "difficulty": "medium"
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: MODELS.text,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING },
              },
              required: ["front", "back"],
            },
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                difficulty: { type: Type.STRING },
              },
              required: ["question", "options", "correctAnswer", "explanation", "difficulty"],
            },
          },
        },
        required: ["flashcards", "quiz"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}