import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Simple response - single message only (no context)
export async function getOpenAIResponse(message) {
  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: message,
      },
    ],
  });
  return response.choices[0].message;
}

// Context-based response - full conversation history
// Uncomment this function when you want to use context-based messaging
// export async function getOpenAIResponseWithContext(messages) {
//   const fullMessages = [
//     { role: "system", content: "You are a helpful assistant." },
//     ...messages, // Spread all previous messages (user + assistant)
//   ];
//
//   const response = await openai.chat.completions.create({
//     model: "gemini-2.0-flash",
//     messages: fullMessages,
//   });
//
//   return response.choices[0].message;
// }

export default openai;
