import { List, SimpleListItem } from "@rmwc/list";
import { MenuItem, SimpleMenu } from "@rmwc/menu";
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
            <SimpleMenu
              key={game.date}
              handle={
                <SimpleListItem
                  text={`${new Date(game.date).toString()}`}
                  secondaryText={`Actions: ${
                    game.actions.length
                  } | Players: ${game.players.map((p) => p.name).join(", ")}`}
                  activated={game === activeGame}
                />
              }
            >
              {activeGame === game ? (
                <MenuItem
                  onClick={() => {
                    setGameHistory([...gameHistory, activeGame]);
                    setActiveGame(null);
                  }}
                >
                  Archive
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => {
                    setGameHistory(
                      activeGame
                        ? [...gameHistory.filter((g) => g !== game), activeGame]
                        : gameHistory.filter((g) => g !== game)
                    );
                    setActiveGame(game);
                  }}
                >
                  Activate
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  if (game === activeGame) {
                    setActiveGame(null);
                  } else {
                    setGameHistory(gameHistory.filter((g) => g !== game));
                  }
                }}
              >
                Remove
              </MenuItem>
            </SimpleMenu>
          );
        })}
    </List>
  );
}
