"""Gemini LLM client using google-genai SDK."""

import json
import logging
import re
from typing import Any

from google import genai

from src.config import settings

logger = logging.getLogger(__name__)

_client = None

def _get_client():
    """Lazy-initialize the Gemini client singleton."""
    global _client
    if _client is None:
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY not configured")
        _client = genai.Client(api_key=settings.gemini_api_key)
        logger.info("Gemini client initialized (model: %s)", settings.gemini_model)
    return _client

def parse_json_response(content: str) -> dict:
    """Helper to parse JSON from markdown code blocks or plain text."""
    try:
        content = content.replace("```json", "").replace("```", "").strip()
        return json.loads(content)
    except json.JSONDecodeError:
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass
        logger.warning(f"Failed to parse JSON response: {content[:200]}")
        return {"raw_content": content, "parse_error": True}

class GeminiClient:
    """Class wrapper for Gemini chat that mirrors GroqClient API."""

    def __init__(self):
        self.client = _get_client()

    async def chat(
        self,
        messages: list[dict[str, str]],
        model: str | None = None,
        temperature: float = 0.5,
        max_tokens: int = 4096,
        json_mode: bool = False,
    ) -> dict[str, Any]:
        """Send chat completion to Gemini API (async)."""
        target_model = model or settings.gemini_model

        system_instruction = None
        gemini_contents = []

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            if role == "system":
                system_instruction = content
            elif role == "assistant":
                gemini_contents.append({"role": "model", "parts": [{"text": content}]})
            else:
                gemini_contents.append({"role": "user", "parts": [{"text": content}]})

        config = {"temperature": temperature, "max_output_tokens": max_tokens}
        if system_instruction:
            config["system_instruction"] = system_instruction
        if json_mode:
            config["response_mime_type"] = "application/json"

        try:
            response = await self.client.aio.models.generate_content(
                model=target_model,
                contents=gemini_contents,
                config=config,
            )
            answer = response.text
        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            raise e

        # Mocking Groq format for seamless pipeline integration
        return {
            "content": answer,
            "model": target_model,
            "usage": {
                "prompt": 0,
                "completion": 0,
                "total": 0,
            },
        }

    async def fast_chat(self, messages: list[dict[str, str]], temperature: float = 0.5, max_tokens: int = 4096, json_mode: bool = False) -> dict[str, Any]:
        """Fast chat mapped to flash model."""
        return await self.chat(messages, model="gemini-2.5-flash", temperature=temperature, max_tokens=max_tokens, json_mode=json_mode)

async def gemini_chat(messages, model=None, temperature=0.5, max_tokens=4096, json_mode=False):
    client = GeminiClient()
    return await client.chat(messages, model, temperature, max_tokens, json_mode)
