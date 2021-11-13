import { createContext, useContext, ReactNode } from "react";
import { ClueBoard } from "../storage/boards";
import { ClueGame } from "../storage/game";
import { useLocalItem } from "../utils/localforage";

const emptyArray: never[] = [];
const customBoards: ClueBoard[] = [
  {
    name: "Cluedronken",
    categories: ["Verdachten", "Wapens", "Locaties"],
    cards: [
      ...["Bart", "Eline", "Irene", "Jari", "Mike", "Naomi"].map((name) => ({
        category: 0,
        name,
      })),
      ...[
        "Biertje",
        "Flesje pino",
        "Stinkbrie",
        "Waakhond",
        "Wimpers",
        "Zweepje",
      ].map((name) => ({ category: 1, name })),
      ...[
        "Bed",
        "Berlijn",
        "Club G",
        "Friesland",
        "Groene Ster",
        "Hamburg",
        "Oliveo",
        "Strand",
        "Ventura Toernooi",
      ].map((name) => ({ category: 2, name })),
    ],
  },
];
function useLocalItemsValue() {
  return {
    customBoards: useLocalItem<ClueBoard[]>("customBoards", customBoards),
    activeGame: useLocalItem<ClueGame | null>("activeGame", null),
    gameHistory: useLocalItem<ClueGame[]>("gameHistory", emptyArray),
    currentPage: useLocalItem<"game" | "games">("current-page", "game"),
  };
}

type LocalItemsValue = ReturnType<typeof useLocalItemsValue>;

const LocalItemsContext = createContext<null | LocalItemsValue>(null);

export function LocalItemsProvider(props: { children: ReactNode }) {
  return (
    <LocalItemsContext.Provider value={useLocalItemsValue()}>
      {props.children}
    </LocalItemsContext.Provider>
  );
}

export function useLocalItems() {
  const ctx = useContext(LocalItemsContext);
  if (!ctx) {
    throw new Error("There was no CtxContextProvider wrapped!");
  }
  return ctx;
}
