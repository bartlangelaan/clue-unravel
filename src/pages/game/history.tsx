import { Avatar } from "@rmwc/avatar";
import { List, SimpleListItem } from "@rmwc/list";
import { useGameCalculator } from "../../providers/game-calculator";
import { ClueBoard } from "../../storage/boards";
import { ClueGame, useActiveGame } from "../../storage/game";
import { purpleAvatar } from "../../utils/avatarStyles";
import { ErrorFallback } from "../../utils/ErrorFallback";
import styles from "./history.module.css";

interface Props {
  board: ClueBoard;
  activeGame: ClueGame;
  setActiveGame: ReturnType<typeof useActiveGame>[1];
}
export function ActiveGameHistory(props: Props) {
  const { board, activeGame } = props;
  const { calculatedActiveGame } = useGameCalculator();

  return (
    <List twoLine>
      {activeGame.actions.map((action, actionI) => {
        return action.type === "suggestion" ? (
          <SimpleListItem
            key={actionI}
            className={styles.historyItem}
            graphic={
              <Avatar
                name={activeGame.players[action.player].name}
                style={purpleAvatar}
              />
            }
            text={`Suggestion - ${
              typeof action.playerDisproved !== "undefined"
                ? `disproved by ${
                    activeGame.players[action.playerDisproved].name
                  }${
                    typeof action.card !== "undefined"
                      ? ` with ${board.cards[action.card].name}`
                      : ""
                  }`
                : `not disproved`
            }`}
            secondaryText={
              <>
                {action.suggestedCards.map((cardI) => {
                  const possiblyShown = !calculatedActiveGame?.certainties.some(
                    (c) =>
                      c.player === (action.playerDisproved ?? action.player) &&
                      c.card === cardI &&
                      c.owner === false
                  );
                  return (
                    <div
                      key={cardI}
                      className={`${styles.suggestedCard} ${
                        possiblyShown ? "" : styles.suggestedCardNotShown
                      }`}
                    >
                      {board.cards[cardI].name}
                    </div>
                  );
                })}
              </>
            }
          />
        ) : null;
      })}
    </List>
  );
}

export function ActiveGameHistoryFallback() {
  return (
    <ErrorFallback
      screen="Active game - History"
      actions={[
        {
          label: "Remove the latest action",
          action: ({ activeGame, setActiveGame }) => {
            if (activeGame?.actions.length) {
              const actions = [...activeGame.actions];
              actions.splice(actions.length - 1, 1);
              setActiveGame({ ...activeGame, actions });
              alert(
                `Removed latest action, now ${actions.length} actions left. Please refresh.`
              );
            } else {
              alert("No actions available.");
            }
          },
        },
      ]}
    />
  );
}
