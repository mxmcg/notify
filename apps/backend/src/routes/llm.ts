import { Router } from "express";
import { LLMProcessRequest } from "../schemas/task";
import { processTaskWithLLM, getLLMResponse } from "../services/openai";
import { prisma } from "../prisma";

const router = Router();

// Process any text with LLM (not tied to a specific task)
router.post("/process", async (req, res) => {
  try {
    const { prompt, model = "gpt-3.5-turbo" } = req.body;
    
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ 
        error: "Prompt is required and must be a string" 
      });
    }

    // Create a temporary LLM response record for tracking
    const llmResponse = await prisma.lLMResponse.create({
      data: {
        taskId: "", // No associated task
        prompt,
        response: "",
        model,
        status: "PROCESSING",
      },
    });

    try {
      // Import OpenAI here to avoid circular imports
      const OpenAI = require("openai").default;
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides concise, accurate information.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || "";
      const tokens = completion.usage?.total_tokens;
      
      // Calculate cost (simplified)
      const cost = (model === "gpt-4" ? 0.03 : 0.002) * (tokens || 0) / 1000;

      // Update the response with results
      await prisma.lLMResponse.update({
        where: { id: llmResponse.id },
        data: {
          response,
          tokens,
          cost,
          status: "COMPLETED",
        },
      });

      res.json({
        id: llmResponse.id,
        prompt,
        response,
        model,
        tokens,
        cost,
        status: "COMPLETED",
      });
    } catch (error) {
      // Update the response with error
      await prisma.lLMResponse.update({
        where: { id: llmResponse.id },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to process prompt",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get LLM response by ID
router.get("/responses/:responseId", async (req, res) => {
  try {
    const response = await getLLMResponse(req.params.responseId);
    
    if (!response) {
      return res.status(404).json({ error: "LLM response not found" });
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch LLM response",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// List all LLM responses with pagination
router.get("/responses", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const [responses, total] = await Promise.all([
      prisma.lLMResponse.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          task: true,
        },
      }),
      prisma.lLMResponse.count(),
    ]);

    res.json({
      responses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch LLM responses",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;