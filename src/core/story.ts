import { STORY } from '../content/story'
import type { GameState } from './state'
import { isMet } from './unlocks'

/** Sends every radio message whose trigger is met and that was not sent before. */
export function updateStory(state: GameState): void {
  for (const def of STORY) {
    if (!state.meta.storyLog.includes(def.id) && isMet(state, def.trigger)) {
      state.meta.storyLog.push(def.id)
    }
  }
}

export function unreadMessages(state: GameState): number {
  return state.meta.storyLog.length - state.meta.storyRead
}

export function markMessagesRead(state: GameState): void {
  state.meta.storyRead = state.meta.storyLog.length
}
