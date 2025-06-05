import { Router } from "express";
import { prisma } from "../prisma";
import { TaskCreate, TaskUpdate, LLMProcessRequest } from "../schemas/task";
import { 
  processTaskWithLLM, 
  getTaskLLMResponses, 
  getLLMResponse 
} from "../services/openai";

const router = Router();

// List all tasks with optional LLM response inclusion
router.get("/", async (req, res) => {
  try {
    const includeLLMResponses = req.query.include === "llm-responses";
    
    const tasks = await prisma.task.findMany({
      include: includeLLMResponses ? {
        llmResponses: {
          orderBy: { createdAt: "desc" },
          take: 5, // Latest 5 responses per task
        }
      } : undefined,
      orderBy: { createdAt: "desc" },
    });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch tasks",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get single task with LLM responses
router.get("/:id", async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ 
      where: { id: req.params.id },
      include: {
        llmResponses: {
          orderBy: { createdAt: "desc" },
        }
      }
    });
    
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch task",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Create new task
router.post("/", async (req, res) => {
  try {
    const data = TaskCreate.parse(req.body);
    const task = await prisma.task.create({ data });
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to create task",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const payload = TaskUpdate.parse({ ...req.body, id: req.params.id });
    
    const task = await prisma.task.update({
      where: { id: payload.id },
      data: {
        title: payload.title,
        description: payload.description,
        scheduledTime: payload.scheduledTime,
        repeatType: payload.repeatType,
        isEnabled: payload.isEnabled,
        notificationId: payload.notificationId,
      },
    });
    
    res.json(task);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.message 
      });
    }
    
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.status(500).json({ 
      error: "Failed to update task",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.status(500).json({ 
      error: "Failed to delete task",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Process task with LLM
router.post("/:id/process", async (req, res) => {
  try {
    const request = LLMProcessRequest.parse({
      ...req.body,
      taskId: req.params.id,
    });
    
    const responseId = await processTaskWithLLM(request);
    
    res.status(202).json({ 
      message: "Task processing started",
      responseId,
      status: "PROCESSING"
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.message 
      });
    }
    
    if (error instanceof Error && error.message === "Task not found") {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.status(500).json({ 
      error: "Failed to process task",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get LLM responses for a task
router.get("/:id/responses", async (req, res) => {
  try {
    const responses = await getTaskLLMResponses(req.params.id);
    res.json(responses);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch LLM responses",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get specific LLM response
router.get("/:id/responses/:responseId", async (req, res) => {
  try {
    const response = await getLLMResponse(req.params.responseId);
    
    if (!response) {
      return res.status(404).json({ error: "LLM response not found" });
    }
    
    // Verify the response belongs to the task
    if (response.taskId !== req.params.id) {
      return res.status(404).json({ error: "LLM response not found for this task" });
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch LLM response",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
