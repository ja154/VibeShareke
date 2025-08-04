import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set in the environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateDescription(projectTitle: string): Promise<string> {
  const prompt = `You are an expert in writing compelling and concise project descriptions for a social media site for developers.
    Given the project title "${projectTitle}", generate a one or two-sentence description for it.
    Focus on the key technologies and the project's main purpose. Do not use markdown or any special formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "Error generating description. Please try again.";
  }
}
