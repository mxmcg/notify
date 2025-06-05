import OpenAI from "openai";
import { prisma } from "../prisma";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ProcessTaskOptions {
  taskId: string;
  customPrompt?: string;
  model?: "gpt-4" | "gpt-3.5-turbo" | "gpt-4-turbo";
}

export interface LLMResult {
  prompt: string;
  response: string;
  model: string;
  tokens?: number;
  cost?: number;
}

/**
 * Process a task with OpenAI and store the response
 */
export async function processTaskWithLLM(options: ProcessTaskOptions): Promise<string> {
  const { taskId, customPrompt, model = "gpt-3.5-turbo" } = options;

  // Get the task
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Create LLM response record with PROCESSING status
  const llmResponse = await prisma.lLMResponse.create({
    data: {
      taskId,
      prompt: "", // Will be updated below
      response: "",
      model,
      status: "PROCESSING",
    },
  });

  try {
    // Generate the prompt
    const prompt = customPrompt || generatePromptFromTask(task.query, task.frequency);

    // Update the prompt in the database
    await prisma.lLMResponse.update({
      where: { id: llmResponse.id },
      data: { prompt },
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides concise, accurate information based on user queries. Focus on delivering the most relevant and up-to-date information.",
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
    const cost = calculateCost(model, tokens || 0);

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

    return llmResponse.id;
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
}

/**
 * Generate a prompt from task query and frequency
 */
function generatePromptFromTask(query: string, frequency: string): string {
  return `
Task: ${query}
Frequency: ${frequency}

Please provide a comprehensive response to the task query above. 
Consider the frequency context when relevant (e.g., if it's daily, provide current/today's information; if weekly, provide a weekly summary).

Response:`.trim();
}

/**
 * Calculate estimated cost based on model and tokens
 * Prices as of 2024 (approximate)
 */
function calculateCost(model: string, tokens: number): number {
  const pricing: Record<string, number> = {
    "gpt-3.5-turbo": 0.002 / 1000, // $0.002 per 1K tokens
    "gpt-4": 0.03 / 1000,          // $0.03 per 1K tokens
    "gpt-4-turbo": 0.01 / 1000,    // $0.01 per 1K tokens
  };

  return (pricing[model] || 0) * tokens;
}

/**
 * Get LLM responses for a task
 */
export async function getTaskLLMResponses(taskId: string) {
  return prisma.lLMResponse.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a specific LLM response
 */
export async function getLLMResponse(responseId: string) {
  return prisma.lLMResponse.findUnique({
    where: { id: responseId },
    include: {
      task: true,
    },
  });
}