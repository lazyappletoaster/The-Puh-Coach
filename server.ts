import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/coach/evaluate', async (req, res) => {
    try {
      const {
        lessonTitle,
        sciencePrinciple,
        briefing,
        prompt,
        targetCues,
        userText,
        audioBase64,
        audioMimeType,
        mode,
      } = req.body as {
        lessonTitle?: string;
        sciencePrinciple?: string;
        briefing?: string;
        prompt?: string;
        targetCues?: string[];
        userText?: string;
        audioBase64?: string;
        audioMimeType?: string;
        mode?: 'voice' | 'text';
      };

      if (!lessonTitle || !sciencePrinciple || !prompt) {
        res.status(400).json({ error: 'Missing required lesson context.' });
        return;
      }

      const ai = getGeminiClient();
      let evaluatedSpeech = (userText ?? '').trim();

      if (mode === 'voice' && audioBase64) {
        const mimeType = audioMimeType && audioMimeType.startsWith('audio/')
          ? audioMimeType.split(';')[0]
          : 'audio/webm';

        const transcribeResp = await ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: audioBase64,
                },
              },
              {
                text: 'Provide an exact verbatim transcript of the spoken words. Preserve filler words like um, uh, or like so a speaking coach can assess fluency. If no intelligible speech is present, respond only with [inaudible].',
              },
            ],
          },
        });

        const transcript = (transcribeResp.text ?? '').trim();
        if (!transcript || transcript === '[inaudible]') {
          res.status(400).json({
            error: 'No clear speech was detected in your recording. Try speaking closer to the mic or use Text mode.',
          });
          return;
        }
        evaluatedSpeech = transcript;
      }

      if (!evaluatedSpeech) {
        res.status(400).json({ error: 'Please record your voice or enter a spoken response to evaluate.' });
        return;
      }

      const cuesList = Array.isArray(targetCues) && targetCues.length > 0
        ? targetCues.join('; ')
        : 'Clarity, psychological warmth, autonomy respect, low cognitive load';

      const evaluationPrompt = [
        `Lesson: ${lessonTitle}`,
        `Psychology Behind It: ${sciencePrinciple}`,
        briefing ? `Street Breakdown: ${briefing}` : '',
        `Real-Life Situation: ${prompt}`,
        `What Works Here: ${cuesList}`,
        `Input Mode: ${mode === 'voice' ? 'Spoken Voice Transcript (verbatim)' : 'Written Spoken Draft'}`,
        `Learner's Response: "${evaluatedSpeech}"`,
      ].filter(Boolean).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: evaluationPrompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction: [
            'You are the coaching engine inside The Puh Coach app—a sharp, street-smart, supportive interaction trainer helping guys talk naturally, playfully, and respectfully with girls in real life (cafes, bars, parties, streets, first dates, texting).',
            'Teach in plain, punchy, everyday street language—never sound like a stiff college textbook or therapist. Still keep every piece of advice 100% backed by real psychology and vocal timing—never cheesy pickup lines, negging, or pushy manipulation.',
            'Focus strictly on real-world social interaction and how it actually lands with her.',
            'Be direct, encouraging, and practical (Duolingo-style clarity). Score 0-100 where >= 65 passes the rep.',
          ].join(' '),
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.INTEGER,
                description: 'Overall rep score from 0 to 100 based on chill warmth, natural flow, respect for her space, and nailing the lesson skill.',
              },
              passed: {
                type: Type.BOOLEAN,
                description: 'True if score >= 65.',
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactly 2 crisp, street-smart things the guy did right in this rep.',
              },
              psychologyBreakdown: {
                type: Type.STRING,
                description: '2 plain-English sentences explaining why this lands well (or misses) psychologically in her head during a real interaction—no stiff academic jargon.',
              },
              vocalAndDeliveryTip: {
                type: Type.STRING,
                description: '1-2 practical sentences on pace, cutting fillers like um/like, pausing cleanly, or phrasing vibe.',
              },
              improvedExample: {
                type: Type.STRING,
                description: 'A natural, smooth, non-cheesy way to say it out loud in real life.',
              },
              coachSummary: {
                type: Type.STRING,
                description: 'Direct, motivating 1-2 sentence app coaching takeaway in everyday street language.',
              },
            },
            required: [
              'score',
              'passed',
              'strengths',
              'psychologyBreakdown',
              'vocalAndDeliveryTip',
              'improvedExample',
              'coachSummary',
            ],
          },
        },
      });

      const rawJson = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawJson);

      res.json({
        transcript: evaluatedSpeech,
        score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
        passed: Boolean(parsed.passed),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
        psychologyBreakdown: String(parsed.psychologyBreakdown ?? ''),
        vocalAndDeliveryTip: String(parsed.vocalAndDeliveryTip ?? ''),
        improvedExample: String(parsed.improvedExample ?? ''),
        coachSummary: String(parsed.coachSummary ?? ''),
      });
    } catch (err) {
      console.error('Coach evaluate error:', err);
      const message = err instanceof Error ? err.message : 'Unable to evaluate response right now.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/coach/tts', async (req, res) => {
    try {
      const { text, style } = req.body as { text?: string; style?: string };
      const cleanText = (text ?? '').trim().slice(0, 600);
      if (!cleanText) {
        res.status(400).json({ error: 'Text is required for model voice playback.' });
        return;
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: style || 'Warm, calm, conversational confidence with natural pauses',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        res.status(502).json({ error: 'Voice synthesis did not return audio data.' });
        return;
      }

      res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    } catch (err) {
      console.error('Coach TTS error:', err);
      const message = err instanceof Error ? err.message : 'Unable to synthesize model voice.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });

    app.get('/@vite/client', async (_req, res, next) => {
      try {
        const result = await vite.transformRequest('/@vite/client');
        if (result?.code) {
          const safeCode = result.code.replace(
            'transport.connect(createHMRHandler(handleMessage));',
            '/* HMR WebSocket disabled */'
          );
          res.type('application/javascript').send(safeCode);
          return;
        }
      } catch {
        // Fall through to Vite middleware if transformRequest fails
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Puh Coach server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
