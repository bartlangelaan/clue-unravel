import { Avatar } from "@rmwc/avatar";
import { Typography } from "@rmwc/typography";
import { useBoards } from "../../storage/boards";
import { ClueAction, ClueGame, useActiveGame } from "../../storage/game";
import { Ripple } from "@rmwc/ripple";
import { ChipSet } from "@rmwc/chip";
import { purpleAvatar } from "../../utils/avatarStyles";
import { Fab } from "@rmwc/fab";
import { ErrorFallback } from "../../utils/ErrorFallback";
import { ClueCard } from "../../utils/ClueCard";

interface Props {
  board: ReturnType<typeof useBoards>["boards"][0];
  activeGame: ClueGame;
  setActiveGame: ReturnType<typeof useActiveGame>[1];
}
export function ActiveGameAction(props: Props) {
  const { board, activeGame, setActiveGame } = props;

  const lastPlayer = activeGame.actions[activeGame.actions.length - 1]?.player;

  const nextPlayer =
    typeof lastPlayer === "number"
      ? (lastPlayer + 1) % activeGame.players.length
      : 0;

  const newAction: ClueAction = activeGame.newAction || {
    type: "suggestion",
    player: nextPlayer,
    suggestedCards: [],
  };
  return (
    <>
      <Typography use="headline6" tag="h2">
        Player
      </Typography>
      <PlayerSelector
        activeGame={activeGame}
        selected={newAction.player}
        onSelect={(player) => {
          setActiveGame({
            ...activeGame,
            newAction: { ...newAction, player },
          });
        }}
      />

      <Typography use="caption" tag="p" style={{ textAlign: "center" }}>
        Calculated player: {activeGame.players[nextPlayer].name}
      </Typography>

      {newAction.type === "suggestion" && (
        <>
          <Typography use="headline6" tag="h2">
            Suggestion
          </Typography>

          {board.categories.map((category, categoryI) => (
            <ChipSet key={categoryI} choice>
              {board.cards.map((card, cardI) => {
                if (card.category !== categoryI) return null;
                return (
                  <ClueCard
                    key={cardI}
                    card={cardI}
                    board={board}
                    selected={newAction.suggestedCards.includes(cardI)}
                    onInteraction={() => {
                      setActiveGame({
                        ...activeGame,
                        newAction: {
                          ...newAction,
                          suggestedCards: [
                            ...newAction.suggestedCards.filter(
                              (c) => board.cards[c].category !== categoryI
                            ),
                            cardI,
                          ].sort((a, b) => a - b),
                        },
                      });
                    }}
                  />
                );
              })}
            </ChipSet>
          ))}
          <Typography use="headline6" tag="h2">
            Disproved by
          </Typography>

          <PlayerSelector
            activeGame={activeGame}
            selected={newAction.playerDisproved ?? newAction.player}
            onSelect={(player) => {
              setActiveGame({
                ...activeGame,
                newAction: {
                  ...newAction,
                  playerDisproved:
                    player === newAction.player ? undefined : player,
                },
              });
            }}
          />
          {typeof newAction.playerDisproved === "undefined" && (
            <Typography use="caption" tag="p" style={{ textAlign: "center" }}>
              This means, disproved by no-one.
            </Typography>
          )}
          {typeof newAction.playerDisproved !== "undefined" && (
            <>
              <Typography use="headline6" tag="h2">
                Card shown
              </Typography>
              <ChipSet choice>
                {newAction.suggestedCards.map((cardI) => {
                  return (
                    <ClueCard
                      card={cardI}
                      board={board}
                      selected={newAction.card === cardI}
                      onInteraction={() => {
                        setActiveGame({
                          ...activeGame,
                          newAction: {
                            ...newAction,
                            card: newAction.card === cardI ? undefined : cardI,
                          },
                        });
                      }}
                    />
                  );
                })}
              </ChipSet>
            </>
          )}
          <div style={{ height: 80 }}>
            <Fab
              icon="add"
              label="Create"
              style={{ position: "fixed", right: 16, bottom: 16 }}
              onClick={() => {
                setActiveGame({
                  ...activeGame,
                  actions: [...activeGame.actions, newAction],
                  newAction: undefined,
                });
              }}
            />
          </div>
        </>
      )}
    </>
  );
}

export function PlayerSelector(props: {
  activeGame: ClueGame;
  selected: number;
  onSelect: (player: number) => void;
}) {
  return (
    <Typography
      use="body1"
      tag="div"
      style={{ display: "flex", justifyContent: "space-around" }}
    >
      {props.activeGame.players.map((player, i) => {
        return (
          <Ripple key={i}>
            <Avatar
              size="xlarge"
              name={player.name}
              style={props.selected === i ? purpleAvatar : undefined}
              onClick={() => props.onSelect(i)}
            />
          </Ripple>
        );
      })}
    </Typography>
  );
}

export function ActiveGameActionFallback() {
  return (
    <ErrorFallback
      screen="Active game - Action"
      actions={[
        {
          label: "Reset the new action",
          action: ({ activeGame, setActiveGame }) => {
            if (activeGame) {
              setActiveGame({ ...activeGame, newAction: undefined });
              alert("Resetted the new action, please refresh.");
            } else {
              alert("No new action available");
            }
          },
        },
      ]}
    />
  );
}
