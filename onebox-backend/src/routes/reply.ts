import express from "express";
import OpenAI from "openai";
import { getMostRelevantReference } from "../vectorStore";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

router.post("/suggest", async (req, res) => {
  const { emailBody } = req.body;
  if (!emailBody) return res.status(400).json({ error: "emailBody is required" });

  try {
    const reference = getMostRelevantReference(emailBody);

    const prompt = `
You are an assistant. Use the following reference info to reply politely:
"${reference}"

Incoming email:
"${emailBody}"

Suggest a concise reply.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    const reply = completion.choices[0].message?.content;
    res.json({ reply });
  } catch (err: any) {
    console.error("OpenAI Error:", err.response?.data || err.message);

    const mockReply = `Thanks for your email! I am available to discuss further.`;
    res.json({ reply: mockReply });
  }
});

export default router;
