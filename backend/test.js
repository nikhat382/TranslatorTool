import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Say hello" }],
  max_tokens: 50
})
.then(r => console.log('✅ OpenAI works!', r.choices[0].message.content))
.catch(e => console.error('❌', e.message));