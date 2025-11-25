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

// Context-based response - with last N messages as context
export async function getOpenAIResponseWithContext(message, previousMessages = []) {
  const systemMessage = { 
    role: "system", 
    content: "You are a helpful AI assistant. Use the conversation context to provide relevant responses." 
  };
  
  // Get last 2 conversation pairs (4 messages) for context
  const contextMessages = previousMessages.slice(-4).map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      systemMessage,
      ...contextMessages,
      { role: "user", content: message }
    ],
  });

  return response.choices[0].message;
}

// Format resume text for analysis (Step 1)
export async function formatResumeForAnalysis(resumeText) {
  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    max_tokens: 5000,
    messages: [
      { 
        role: "system", 
        content: `You are a resume formatting expert. Your job is to take raw resume text and format it into a structured prompt that can be used for AI-based resume analysis, scoring, and improvement suggestions.
        
Format the resume into clear sections:
- Personal Information
- Professional Summary
- Skills
- Work Experience
- Education
- Certifications (if any)
- Projects (if any)

Make sure to preserve all important information while organizing it clearly. Keep within 5000 tokens.` 
      },
      {
        role: "user",
        content: `Format this resume text for AI analysis:\n\n${resumeText}`,
      },
    ],
  });
  return response.choices[0].message.content;
}

// Analyze and score resume (Step 2)
export async function analyzeResume(formattedResume) {
  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      { 
        role: "system", 
        content: `You are an expert resume analyst and career coach. Analyze the provided resume and give:

1. **Overall Score**: Rate the resume out of 100
2. **Section Scores** (out of 10 each):
   - Professional Summary
   - Skills Relevance
   - Work Experience Quality
   - Education
   - Formatting & Clarity
   - Keywords & ATS Optimization

3. **Strengths**: List 3-5 strong points of the resume

4. **Areas for Improvement**: List 3-5 specific improvements needed

5. **Actionable Recommendations**: Provide detailed suggestions to improve the resume

6. **Industry-Specific Tips**: Based on the candidate's field, give targeted advice

Be constructive, specific, and helpful. Use markdown formatting for better readability.` 
      },
      {
        role: "user",
        content: formattedResume,
      },
    ],
  });
  return response.choices[0].message;
}

export default openai;
