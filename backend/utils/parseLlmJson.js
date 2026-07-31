/**
 * Extract JSON from an LLM response (strips markdown fences if present).
 * Retries once via optional regenerate callback when parse fails.
 */
async function parseLlmJson(rawText, { regenerate } = {}) {
  const attempt = (text) => {
    if (!text || typeof text !== "string") {
      throw new Error("Empty AI response");
    }

    let cleaned = text.trim();

    const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      cleaned = fenced[1].trim();
    }

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Invalid JSON from AI");
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  };

  try {
    return attempt(rawText);
  } catch (firstError) {
    if (typeof regenerate !== "function") {
      throw firstError;
    }

    const retryText = await regenerate();
    return attempt(retryText);
  }
}

module.exports = {
  parseLlmJson,
};
