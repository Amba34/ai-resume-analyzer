import express from "express";
import Thread from "../models/thread.models.js";
import { getOpenAIResponse, getOpenAIResponseWithContext, formatResumeForAnalysis, analyzeResume } from "../utils/openai.js";
import upload from "../utils/upload.js";
import { extractText } from "../utils/ocr.js";
import fs from "fs";

const router = express.Router();

// Create a new thread
router.post("/test", async (req, res) => {
  try {
    const thread = new Thread({
      title: "New Chat 2",
    });

    const savedThread = await thread.save();
    res.status(201).json(savedThread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all threads
router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find().sort({ updatedAt: -1 });
    res.status(200).json(threads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get thread by ID
router.get("/thread/:threadId", async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.threadId);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    res.status(200).json(thread.messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete thread by ID
router.delete("/thread/:threadId", async (req, res) => {
  try {
    const thread = await Thread.findByIdAndDelete(req.params.threadId);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    res.status(200).json({ message: "Thread deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message and get AI response (with optional file upload)
router.post("/chat", upload.single("file"), async (req, res) => {
  try {
    const { threadId, message } = req.body;

    if (!threadId) {
      return res.status(400).json({ error: "Thread ID is required" });
    }

    let thread;
    let aiResponse;
    let userMessage = message || "";

    // Find existing thread or create new one with user-provided threadId
    thread = await Thread.findById(threadId);

    if (!thread) {
      thread = new Thread({
        _id: threadId,
        title: "Resume Analysis",
      });
    }

    // Check if file is uploaded (Resume Analysis Flow)
    if (req.file) {
      try {
        const filePath = req.file.path;
        const mimeType = req.file.mimetype;

        // Step 1: Extract text from file using OCR
        const extractedText = await extractText(filePath, mimeType);

        // Delete the file after extraction
        fs.unlinkSync(filePath);

        // Step 2: Format resume for analysis (with 5000 token limit)
        const formattedResume = await formatResumeForAnalysis(extractedText);

        // Step 3: Analyze and score the resume
        aiResponse = await analyzeResume(formattedResume);

        // Set user message to indicate file upload
        userMessage = `[Uploaded Resume: ${req.file.originalname}]`;
        
        // Update thread title
        thread.title = `Resume: ${req.file.originalname.substring(0, 30)}`;

      } catch (fileError) {
        // Clean up file if it exists
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {
            console.error("Error deleting file:", e);
          }
        }
        throw fileError;
      }
    } else {
      // Regular Chat Flow (no file uploaded)
      if (!message) {
        return res.status(400).json({ error: "Message or file is required" });
      }

      // Get last 2 conversation pairs for context
      const previousMessages = thread.messages || [];
      
      // Use context-based response with last 4 messages (2 pairs)
      aiResponse = await getOpenAIResponseWithContext(message, previousMessages);
    }

    // Add user message
    thread.messages.push({
      role: "user",
      content: userMessage,
    });

    // Add assistant message
    thread.messages.push({
      role: "assistant",
      content: aiResponse.content,
    });

    // Save thread
    await thread.save();

    res.status(200).json({
      threadId: thread._id,
      response: aiResponse,
    });
  } catch (error) {
    console.error("Error in /chat route:", error);
    res.status(500).json({ error: error.message });
  }
});

// Extract text from uploaded file (image or PDF)
router.post("/extract-text", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // Extract text using OCR
    const extractedText = await extractText(filePath, mimeType);

    // Delete the file after extraction
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: "Text extracted successfully",
      text: extractedText,
      filename: req.file.originalname
    });
  } catch (error) {
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error("Error deleting file:", e);
      }
    }
    
    console.error("Error extracting text:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
