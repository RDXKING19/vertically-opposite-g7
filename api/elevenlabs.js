// api/elevenlabs.js (Vercel-style serverless proxy for ElevenLabs text-to-speech)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY is not configured on server' });
  }

  const { text, voiceId = 'Xb7hH8MSUJpSbSDYk0k2', modelId = 'eleven_multilingual_v2', voice_settings } = req.body || {};
  if (!text) {
    return res.status(400).json({ error: 'Missing text in request body' });
  }

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(r.status).json({ error: errText || 'ElevenLabs API error' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    const arrayBuf = await r.arrayBuffer();
    return res.send(Buffer.from(arrayBuf));
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
