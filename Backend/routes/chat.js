import express from "express";
import Thread from "../models/thread.models.js";
import { getOpenAIResponse } from "../utils/openai.js";

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

// Send message and get AI response
router.post("/chat", async (req, res) => {
  try {
    const { threadId, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!threadId) {
      return res.status(400).json({ error: "Thread ID is required" });
    }

    let thread;

    // Find existing thread or create new one with user-provided threadId
    thread = await Thread.findById(threadId);

    if (!thread) {
      thread = new Thread({
        _id: threadId,
        title: message.substring(0, 50),
      });
    }

    // Add user message
    thread.messages.push({
      role: "user",
      content: message,
    });

    // Get AI response
    const aiResponse = await getOpenAIResponse(message);

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

export default router;
