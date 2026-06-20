# AI Stock Analysis Assistant — Backend

FastAPI + LangGraph agent that answers stock-related questions using real-time Yahoo Finance data.

## Setup

1. Copy `.env.example` to `.env` and fill in your API keys.
2. Install dependencies (requires Python 3.12+):
   ```bash
   pip install uv
   uv sync
   ```
3. Run the server:
   ```bash
   python main.py
   # or
   uvicorn main:app --host 0.0.0.0 --port 8888 --reload
   ```

## API

`POST /api/chat` — streams SSE tokens back.

Body:
```json
{
  "prompt": { "content": "What is Apple's stock price?", "id": "msg_1", "role": "user" },
  "threadId": "thread_abc",
  "responseId": "resp_1"
}
```
