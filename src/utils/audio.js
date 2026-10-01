/* =========================================================================
   AUDIO ENGINE  (ElevenLabs "Alice" pipeline)
   Voice: Alice (Clear, Engaging Educator) — Voice ID: Xb7hH8MSUJpSbSDYk0k2
   Model: eleven_multilingual_v2

   Playback order for every line of narration:
     1. audioMap[text]        -> pre-generated static .mp3 (zero latency)
     2. ElevenLabs on-the-fly -> /api/elevenlabs proxy OR direct API call
     3. NO browser speech fallback — fails gracefully and silently.
   ========================================================================= */
import { audioMap } from './audioMap.js';

export const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';
export const MODEL_ID = 'eleven_multilingual_v2';

export const STYLE_SETTINGS = {
  celebration:   { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true },
  encouragement: { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true },
  question:      { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true },
  emphasis:      { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true },
  thinking:      { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true },
  statement:     { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
  instruction:   { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true }
};

const API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ELEVENLABS_API_KEY) || '';

/* ------------------------------------------------------------------ state */
export let audioMuted = false;
let currentAudioElement = null;
let currentQueue = 0;
const dynamicCache = new Map(); // "style::text" -> Promise<blobUrl | null>
const warmCache = new Map();    // url -> preloaded <audio>

/* ---------------------------------------------------------- URL resolution */
async function fetchDynamic(text, style) {
  const cfg = STYLE_SETTINGS[style] || STYLE_SETTINGS.statement;
  const voice_settings = {
    stability: cfg.stability,
    similarity_boost: cfg.similarity_boost,
    style: cfg.style,
    use_speaker_boost: cfg.use_speaker_boost
  };
  try {
    let res;
    if (API_KEY) {
      res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg', 'xi-api-key': API_KEY },
          body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings })
        }
      );
    } else {
      res = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: VOICE_ID, modelId: MODEL_ID, voice_settings })
      });
    }
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    return null;
  }
}

/** Resolve the audio URL for a line: static map first, then live ElevenLabs. */
export function getAudioUrl(text, style = 'statement') {
  if (audioMap[text]) {
    warmStatic(audioMap[text]);
    return Promise.resolve(audioMap[text]);
  }
  const key = `${style}::${text}`;
  if (!dynamicCache.has(key)) dynamicCache.set(key, fetchDynamic(text, style));
  return dynamicCache.get(key);
}

function warmStatic(url) {
  if (typeof Audio === 'undefined' || warmCache.has(url)) return;
  try {
    const a = new Audio();
    a.preload = 'auto';
    a.src = url;
    warmCache.set(url, a);
  } catch (e) { /* ignore */ }
}

/* --------------------------------------------------------------- playback */
function playUrl(url) {
  return new Promise(resolve => {
    if (typeof Audio === 'undefined') return resolve(false);
    let audio;
    try {
      audio = warmCache.get(url) || new Audio(url);
      audio.currentTime = 0;
    } catch (e) {
      return resolve(false);
    }
    currentAudioElement = audio;
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false);
    const p = audio.play();
    if (p && p.catch) p.catch(() => resolve(false));
  });
}

export function setMuted(m) {
  audioMuted = m;
  if (m) stopNarration();
}

export function stopNarration() {
  currentQueue++;
  if (currentAudioElement) {
    try { currentAudioElement.pause(); } catch (e) { /* ignore */ }
    currentAudioElement = null;
  }
}

/**
 * Play an array of segments one after another.
 * While segment i is playing, segment i+1 is already being resolved/preloaded.
 * A new narrate() call (or stopNarration()) cancels any queue still in flight.
 * If static asset and dynamic fetch both fail, narration skips silently (NO browser speech synthesis fallback).
 */
export async function narrate(segments, autoplay = true) {
  if (!autoplay || audioMuted) return;
  stopNarration();
  const myQueue = ++currentQueue;
  const list = (Array.isArray(segments) ? segments : [segments]).filter(s => s && s.text);
  if (!list.length) return;

  let pending = getAudioUrl(list[0].text, list[0].style);
  for (let i = 0; i < list.length; i++) {
    if (myQueue !== currentQueue || audioMuted) return;
    const urlPromise = pending;
    pending = list[i + 1] ? getAudioUrl(list[i + 1].text, list[i + 1].style) : null; // eager preload
    const url = await urlPromise;
    if (myQueue !== currentQueue || audioMuted) return;
    await (url ? playUrl(url) : Promise.resolve(false));
  }
}

/* ---------------------------------------------------- segment helper API */
export const say = text => ({ text, style: 'statement' });
export const ask = text => ({ text, style: 'question' });
export const cheer = text => ({ text, style: 'celebration' });
export const emphasize = text => ({ text, style: 'emphasis' });
export const think = text => ({ text, style: 'thinking' });
export const celebrate = text => ({ text, style: 'celebration' });
export const instruct = text => ({ text, style: 'encouragement' });
