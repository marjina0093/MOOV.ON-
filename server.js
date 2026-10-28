
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get("/", (req, res) => {
  res.send("MOOV ON AI backend is running.");
});

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key is not configured."
      });
    }

    const message = req.body?.message;
    const language = req.body?.language || "English";

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 4000
    ) {
      return res.status(400).json({
        error: "Enter a message up to 4000 characters."
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        `You are MOOV ON AI, a helpful assistant. ` +
        `Reply in ${language}. ` +
        `Understand the user's question and provide a clear, useful answer. ` +
        `If a problem needs a qualified professional, explain that appropriately.\n\n` +
        `User message: ${message.trim()}`
    });

    res.json({
      reply: result.text || "Please try asking your question again."
    });
  } catch (error) {
    console.error("Gemini request failed:", error.message);
    res.status(500).json({
      error: "Sorry, AI could not answer right now. Please try again."
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`MOOV ON AI server listening on port ${port}`);
});
