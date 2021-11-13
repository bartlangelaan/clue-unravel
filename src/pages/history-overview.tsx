import { List, SimpleListItem } from "@rmwc/list";
import React from "react";
import { useActiveGame, useGameHistory } from "../storage/game";

export function HistoryOverview() {
  const [gameHistory, setGameHistory] = useGameHistory();
  const [activeGame, setActiveGame] = useActiveGame();

  return (
    <List twoLine>
      {(activeGame ? [...gameHistory, activeGame] : gameHistory)
        .sort((a, b) => b.date - a.date)
        .map((game, historyI) => {
          return (
            <SimpleListItem
              key={historyI + game.date}
              text={`${new Date(game.date).toString()}`}
              secondaryText={`Actions: ${
                game.actions.length
              } | Players: ${game.players.map((p) => p.name).join(", ")}`}
              activated={game === activeGame}
              onClick={() => {
                if (game === activeGame) return;
                setGameHistory(
                  activeGame
                    ? [...gameHistory.filter((g) => g !== game), activeGame]
                    : gameHistory.filter((g) => g !== game)
                );
                setActiveGame(game);
              }}
            />
          );
        })}
    </List>
  );
}
