import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, model, conversationId } = req.body;

    if (!message || !model || !conversationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let response;

    if (model === 'chatgpt') {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI tutor. Provide clear, concise, and educational responses. When explaining concepts, use examples and analogies to make them easier to understand."
          },
          {
            role: "user",
            content: message
          }
        ],
      });

      response = {
        content: completion.choices[0].message.content,
        model: 'chatgpt'
      };
    } else {
      const genModel = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await genModel.generateContent(message);
      const responseText = await result.response.text();

      response = {
        content: responseText,
        model: 'gemini'
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error processing chat request:', error);
    return res.status(500).json({ error: 'Failed to process chat request' });
  }
} 
