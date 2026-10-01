import { BADGES } from '../data/badges.js';

export const initialProgress = {
  xp: 0,
  streak: 0,
  bestStreak: 0,
  worldStars: Array(10).fill(null),   // best stars per world across all modes
  boss: Array(10).fill(false),        // trophy earned per world
  badges: {},                         // { badgeId: true }
  simStationsDone: [false, false, false],
  questionsAnsweredInPractice: 0
};

export function progressReducer(state, action) {
  switch (action.type) {
    case 'ANSWER_CORRECT': {
      const streak = state.streak + 1;
      return {
        ...state,
        xp: state.xp + (action.xpGained || 10),
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
        questionsAnsweredInPractice: state.questionsAnsweredInPractice + 1
      };
    }
    case 'ANSWER_WRONG': {
      return {
        ...state,
        streak: 0,
        questionsAnsweredInPractice: state.questionsAnsweredInPractice + 1
      };
    }
    case 'FINISH_WORLD': {
      const worldStars = [...state.worldStars];
      const prev = worldStars[action.worldIndex] ?? 0;
      worldStars[action.worldIndex] = Math.max(prev, action.stars ?? 0);
      return { ...state, worldStars };
    }
    case 'WIN_BOSS': {
      const boss = [...state.boss];
      boss[action.worldIndex] = true;
      return { ...state, boss };
    }
    case 'COMPLETE_SIM_STATION': {
      const simStationsDone = [...state.simStationsDone];
      simStationsDone[action.stationIndex] = true;
      return { ...state, simStationsDone };
    }
    case 'UNLOCK_BADGE': {
      if (state.badges[action.badgeId]) return state;
      return {
        ...state,
        badges: { ...state.badges, [action.badgeId]: true }
      };
    }
    case 'RESET':
      return initialProgress;
    default:
      return state;
  }
}

/**
 * Checks all badge conditions against the current progress state,
 * dispatches UNLOCK_BADGE, and invokes toast callback for newly earned badges.
 */
export function evaluateBadges(state, { justCompletedJourney = false } = {}, dispatch, onBadgeUnlocked) {
  if (!dispatch) return;
  for (const badge of BADGES) {
    if (!state.badges[badge.id] && badge.trigger(state, justCompletedJourney)) {
      dispatch({ type: 'UNLOCK_BADGE', badgeId: badge.id });
      if (onBadgeUnlocked) {
        onBadgeUnlocked(badge);
      }
    }
  }
}
