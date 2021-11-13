import { useMemo } from "react";
import { useLocalItems } from "../providers/local-items";

export interface ClueBoard {
  name: string;
  categories: string[];
  cards: { category: number; name: string }[];
}

function useCustomBoards() {
  return useLocalItems().customBoards;
}

export function useBoards() {
  const [customBoards] = useCustomBoards();
  const boards = useMemo<ClueBoard[]>(
    () => [
      {
        name: "UK edition",
        categories: ["Characters", "Weapons", "Rooms"],
        cards: [
          ...[
            "Miss Scarlett",
            "Rev Green",
            "Colonel Mustard",
            "Professor Plum",
            "Mrs. Peacock",
            "Mrs. White",
          ].map((name) => ({ category: 0, name })),
          ...[
            "Candlestick",
            "Dagger",
            "Lead Pipe",
            "Revolver",
            "Rope",
            "Wrench",
          ].map((name) => ({ category: 1, name })),
          ...[
            "Ballroom",
            "Billiard Room",
            "Conservatory",
            "Dining Room",
            "Hall",
            "Kitchen",
            "Library",
            "Lounge",
            "Study",
          ].map((name) => ({ category: 2, name })),
        ],
      },
      ...customBoards,
    ],
    [customBoards]
  );

  return { boards };
}
