const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.post("/translate", async (req, res) => {
  const { text, direction } = req.body;

  if (!text || !direction) {
    return res.status(400).json({ error: "Missing text or direction" });
  }

  const prompt =
    direction === "to-pidgin"
      ? `Translate the following English text into Nigerian Pidgin English. Return only the translation, nothing else.\n\n"${text}"`
      : `Translate the following Nigerian Pidgin English into standard English. Return only the translation, nothing else.\n\n"${text}"`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const result = data?.content?.[0]?.text;

    if (!result) {
      return res.status(500).json({ error: "No response from Claude" });
    }

    res.json({ translation: result.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.get("/", (req, res) => res.send("Pidgin Translator API is running."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
