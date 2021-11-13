import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import { useBoards } from "../storage/boards";
import { useActiveGame } from "../storage/game";
import { calculateGame } from "../utils/game-calculator";

function useGameCalculatorValue() {
  const [activeGame] = useActiveGame();
  const { boards } = useBoards();

  const calculatedActiveGame = useMemo(
    () => activeGame && calculateGame(activeGame, boards[activeGame.board]),
    [activeGame, boards]
  );

  useEffect(() => {
    console.log(calculatedActiveGame);
  }, [calculatedActiveGame]);

  return {
    calculatedActiveGame,
  };
}

type GameCalculatorValue = ReturnType<typeof useGameCalculatorValue>;

const GameCalculatorContext = createContext<null | GameCalculatorValue>(null);

export function GameCalculatorProvider(props: { children: ReactNode }) {
  return (
    <GameCalculatorContext.Provider value={useGameCalculatorValue()}>
      {props.children}
    </GameCalculatorContext.Provider>
  );
}

export function useGameCalculator() {
  const ctx = useContext(GameCalculatorContext);
  if (!ctx) {
    throw new Error("There was no CtxContextProvider wrapped!");
  }
  return ctx;
}
