import OpenAI from "openai";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from 'mongoose'
import chatRoutes from "./routes/chat.js";
const app = express();

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});




app.use(express.json());
app.use(cors());
app.use("/api", chatRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000");
});

app.post("/test", async (req, res) => {

  const query = req.body.query;
  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: req.body.query,
      },
    ],
  });
  res.send(response.choices[0].message);
});




