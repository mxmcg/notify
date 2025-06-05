# Notify API Documentation

## Overview

Modern full-stack API for task management with OpenAI integration. Built with Express.js, Prisma, and TypeScript.

## Base URL
```
Development: http://localhost:4000/api
```

## Authentication
Currently no authentication required (add JWT later if needed).

## Rate Limiting
- General API: 100 requests per 15 minutes
- LLM endpoints: 10 requests per minute

## Task Management Endpoints

### GET /api/tasks
Get all tasks with optional LLM response inclusion.

**Query Parameters:**
- `include` (optional): Set to "llm-responses" to include latest 5 LLM responses per task

**Response:** Array of Task objects

```json
[
  {
    "id": "uuid",
    "query": "MLB standings summary",
    "frequency": "Every day at 8 AM",
    "isEnabled": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "llmResponses": [...] // if included
  }
]
```

### GET /api/tasks/:id
Get a specific task with all LLM responses.

**Response:** Task object with LLM responses

### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "query": "MLB standings summary",
  "frequency": "Every day at 8 AM",
  "isEnabled": true // optional, defaults to true
}
```

**Response:** Created Task object

### PUT /api/tasks/:id
Update a task.

**Request Body:**
```json
{
  "query": "Updated query", // optional
  "frequency": "Updated frequency", // optional
  "isEnabled": false // optional
}
```

**Response:** Updated Task object

### DELETE /api/tasks/:id
Delete a task and all associated LLM responses.

**Response:** 204 No Content

## LLM Processing Endpoints

### POST /api/tasks/:id/process
Process a task with OpenAI.

**Request Body:**
```json
{
  "customPrompt": "Custom prompt override", // optional
  "model": "gpt-3.5-turbo" // optional: gpt-4, gpt-3.5-turbo, gpt-4-turbo
}
```

**Response:**
```json
{
  "message": "Task processing started",
  "responseId": "uuid",
  "status": "PROCESSING"
}
```

### GET /api/tasks/:id/responses
Get all LLM responses for a task.

**Response:** Array of LLMResponse objects

### GET /api/tasks/:id/responses/:responseId
Get a specific LLM response for a task.

**Response:** LLMResponse object

## General LLM Endpoints

### POST /api/llm/process
Process any text with OpenAI (not tied to a task).

**Request Body:**
```json
{
  "prompt": "Your prompt here",
  "model": "gpt-3.5-turbo" // optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "prompt": "Your prompt here",
  "response": "OpenAI response",
  "model": "gpt-3.5-turbo",
  "tokens": 150,
  "cost": 0.0003,
  "status": "COMPLETED"
}
```

### GET /api/llm/responses/:responseId
Get a specific LLM response.

**Response:** LLMResponse object

### GET /api/llm/responses
Get paginated list of all LLM responses.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "responses": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## Utility Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "environment": "development"
}
```

## Data Models

### Task
```typescript
interface Task {
  id: string;
  query: string;
  frequency: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  llmResponses?: LLMResponse[];
}
```

### LLMResponse
```typescript
interface LLMResponse {
  id: string;
  taskId: string;
  prompt: string;
  response: string;
  model: string;
  tokens: number | null;
  cost: number | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  error: string | null;
  createdAt: Date;
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/notify_db"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key-here"

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS (comma-separated for production)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:8081"
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd apps/backend
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Set up database:**
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Frontend Integration

The API is designed to work seamlessly with the React Native mobile app. Example usage:

```typescript
// Create a task
const task = await fetch('http://localhost:4000/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'MLB standings summary',
    frequency: 'Every day at 8 AM'
  })
});

// Process with OpenAI
const response = await fetch(`http://localhost:4000/api/tasks/${task.id}/process`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo'
  })
});
```