import { STORY_PANELS } from '../data/story.js';
import { getStoryNarration, getAllNarration } from '../utils/narration.js';
import { BAD_SPOKEN } from './toSpoken.js';
import { WORLDS } from '../data/worlds.js';

if (import.meta.env.DEV) {
  // 1. Verify Story Panel Narration Alignment
  STORY_PANELS.forEach((_, i) => {
    const narration = getStoryNarration(i);
    if (!narration || !narration.length) {
      console.warn(`[CrossQuest QA] Story panel ${i + 1} has no narration!`);
    }
  });

  // 2. Check Static Spoken Lines for forbidden symbols
  const allPhrases = getAllNarration();
  allPhrases.forEach(p => {
    if (BAD_SPOKEN.test(p.text)) {
      console.warn(`[CrossQuest QA] Raw mathematical symbol found in spoken phrase: "${p.text}"`);
    }
  });

  // 3. Verify Worlds configuration
  if (WORLDS.length !== 10) {
    console.warn(`[CrossQuest QA] Expected 10 worlds, but found ${WORLDS.length}!`);
  }
}
