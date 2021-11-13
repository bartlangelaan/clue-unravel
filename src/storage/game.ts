import { useLocalItems } from "../providers/local-items";

interface CluePlayer {
  name: string;
  cards: number;
}

interface ClueActionSuggestion {
  type: "suggestion";
  player: number;
  suggestedCards: number[];
  playerDisproved?: number;
  card?: number;
}

interface ClueActionAccusation {
  type: "accusation";
  player: number;
  correct: boolean;
  cards?: string[];
}

export type ClueAction = ClueActionSuggestion | ClueActionAccusation;

export interface ClueGame {
  date: number; // new Date().getTime();
  board: number;
  players: CluePlayer[];
  me: number;
  myCards: number[];
  publicCards: number[];
  actions: ClueAction[];
  /**
   * This is only while the user is still entering an action.
   * After that, it will be moved to 'actions'.
   */
  newAction?: ClueAction;
}

export function useActiveGame() {
  return useLocalItems().activeGame;
}

export function useGameHistory() {
  return useLocalItems().gameHistory;
}
