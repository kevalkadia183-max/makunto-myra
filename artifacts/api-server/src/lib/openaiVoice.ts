import OpenAI, { toFile } from "openai";
import { Buffer } from "node:buffer";

// Portable OpenAI client for voice. Reads standard OpenAI env vars first so
// the app runs unchanged on any host (VPS, etc.) — just set OPENAI_API_KEY.
// Falls back to the Replit-provisioned proxy vars when present.
const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL || process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined;

export const openaiVoiceAvailable = Boolean(apiKey);

const client = apiKey ? new OpenAI({ apiKey, baseURL }) : null;

/** Text-to-speech via the gpt-audio chat model (works on both the proxy and
 *  direct OpenAI). Returns an MP3 buffer. Voice "nova" is a natural female voice. */
export async function openaiTts(text: string): Promise<Buffer> {
  if (!client) throw new Error("OpenAI voice is not configured");
  const response = await client.chat.completions.create({
    model: "gpt-audio-mini",
    modalities: ["text", "audio"],
    audio: { voice: "nova", format: "mp3" },
    messages: [
      {
        role: "system",
        content:
          "You are a text-to-speech engine, not an assistant. Read the text provided by the user out loud EXACTLY as written, word for word. Never answer, respond, add, skip, or change anything.",
      },
      { role: "user", content: `Read this text aloud verbatim:\n\n${text}` },
    ],
  });
  const audioData = (response.choices[0]?.message as { audio?: { data?: string } })?.audio?.data ?? "";
  if (!audioData) throw new Error("OpenAI TTS returned no audio");
  return Buffer.from(audioData, "base64");
}

/** Speech-to-text via gpt-4o-mini-transcribe. Accepts iOS m4a/mp4, webm, wav, mp3. */
export async function openaiStt(audio: Buffer, mime: string): Promise<string> {
  if (!client) throw new Error("OpenAI voice is not configured");
  const ext = mime.includes("mp4") ? "m4a" : mime.includes("webm") ? "webm" : mime.includes("wav") ? "wav" : mime.includes("mpeg") || mime.includes("mp3") ? "mp3" : "m4a";
  const file = await toFile(audio, `utterance.${ext}`);
  const response = await client.audio.transcriptions.create({
    file,
    model: "gpt-4o-mini-transcribe",
  });
  return response.text ?? "";
}
