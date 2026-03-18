# AURA – Agentic User Reasoning Assistant

AURA is an AI-powered agentic assistant built for the hackathon. It doesn't just respond to prompts—it **thinks**, **plans**, and **guides** users step-by-step through complex tasks like a real mentor.

## 🌟 Core Features

- **Agentic Planning Engine**: Decomposes complex user queries into structured, multi-step execution plans.
- **Dynamic Execution**: Executes tasks step-by-step, adapting based on user feedback and context.
- **Multi-Domain Intelligence**: 
  - 📚 **Study Companion**: Exam prep, topic breakdowns, adaptive quizzes.
  - 💼 **Career Coach**: Resume analysis, interview prep, job roadmaps.
  - 💰 **Finance Coach**: Budgeting, savings tracking, expense analysis.
  - 🧘 **Wellness Guide**: Habit building, routines, mindfulness.
- **Context-Aware Memory**: Maintains conversational context and plan state across the session.
- **Premium UI**: Sleek dark theme with glassmorphism, fluid animations, and a visual plan tracker.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + React + Tailwind-style custom CSS
- **Backend**: Next.js Serverless API Routes
- **AI/LLM**: OpenAI API (`gpt-4o-mini` by default)
- **Streaming**: Server-Sent Events (SSE) for real-time token streaming

## 🚀 Getting Started

### Prerequisites

You'll need an OpenAI API key to run AURA.

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your environment variables:**
   Copy the example environment file and add your OpenAI API key:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   OPENAI_MODEL=gpt-4o-mini
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 💡 How it Works (The Agent Loop)

1. **Input validation & Safety**: User messages are checked for harmful content and PII.
2. **Intent Routing**: The system determines if the query is complex (needs planning) or simple (direct response).
3. **Planning (Agent 1)**: For complex queries, AURA breaks the problem down into actionable steps.
4. **Execution (Agent 2)**: AURA executes the first step of the plan and streams the output to the user.
5. **State Management**: The UI visually updates the plan tracker, allowing the user to read the response and manually advance to the next step when ready.
