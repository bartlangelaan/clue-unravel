import { Typography } from "@rmwc/typography";
import { useActiveGame, useGameHistory } from "../../storage/game";
import { Select } from "@rmwc/select";
import { TextField } from "@rmwc/textfield";
import { List, ListItem, ListItemGraphic, ListItemMeta } from "@rmwc/list";
import { Avatar } from "@rmwc/avatar";
import { Fab } from "@rmwc/fab";
import { IconButton } from "@rmwc/icon-button";
import { ChipSet, Chip } from "@rmwc/chip";
import { useBoards } from "../../storage/boards";
import { purpleAvatar } from "../../utils/avatarStyles";

interface Props {
  boards: ReturnType<typeof useBoards>["boards"];
  board: ReturnType<typeof useBoards>["boards"][0];
  activeGame: NonNullable<ReturnType<typeof useActiveGame>[0]>;
  setActiveGame: ReturnType<typeof useActiveGame>[1];
}
export function ActiveGameSettings(props: Props) {
  const { boards, board, activeGame, setActiveGame } = props;
  const [gameHistory, setGameHistory] = useGameHistory();

  const cardsOnPlayers =
    board.cards.length -
    board.categories.length -
    activeGame.publicCards.length;

  const averageCards = cardsOnPlayers / activeGame.players.length;

  return (
    <>
      <Typography use="headline6" tag="h2">
        Basic info
      </Typography>
      <Typography use="body1" tag="p">
        Game created on {new Date(activeGame.date).toLocaleString("en-GB")}.
      </Typography>
      <Select
        enhanced
        label="Board edition"
        options={boards.map((b, i) => ({
          label: `${b.name} (${b.cards.length} cards)`,
          value: i.toString(),
        }))}
        value={activeGame.board.toString()}
        onChange={(e) =>
          setActiveGame({
            ...activeGame,
            board: parseInt(e.currentTarget.value, 10),
          })
        }
      />
      <Typography use="headline6" tag="h2">
        Players
      </Typography>
      <List nonInteractive>
        {activeGame.players.map((player, i) => (
          <ListItem ripple={false} key={`${i}${activeGame.players.length}`}>
            <ListItemGraphic
              icon={
                <Avatar size="medium" name={player.name} style={purpleAvatar} />
              }
            />
            <TextField
              label={`Player ${i + 1} name`}
              defaultValue={player.name}
              onChange={(e) => {
                const players = clone(activeGame.players);
                players[i].name = e.currentTarget.value;
                setActiveGame({ ...activeGame, players });
              }}
              style={{ flexGrow: 1 }}
            />
            {Math.floor(averageCards) !== Math.ceil(averageCards) && (
              <Select
                options={[
                  Math.floor(averageCards).toString(),
                  Math.ceil(averageCards).toString(),
                ]}
                value={player.cards.toString()}
                onChange={(e) => {
                  const players = clone(activeGame.players);
                  players[i].cards = parseInt(e.currentTarget.value);
                  setActiveGame({ ...activeGame, players });
                }}
                rootProps={{ style: { width: 70 } }}
              />
            )}
            <ListItemMeta style={{ whiteSpace: "nowrap" }}>
              {activeGame.players.length > 1 && (
                <IconButton
                  icon="remove"
                  onClick={() => {
                    const players = [...activeGame.players];
                    players.splice(i, 1);
                    setActiveGame({ ...activeGame, players });
                  }}
                />
              )}
            </ListItemMeta>
          </ListItem>
        ))}
      </List>
      <Fab
        mini
        icon="add"
        label="Create"
        onClick={(e) => {
          const cards = Math.floor(
            cardsOnPlayers / (activeGame.players.length + 1)
          );
          setActiveGame({
            ...activeGame,
            players: [
              ...activeGame.players.map((p) => ({ ...p, cards })),
              { name: "", cards },
            ],
          });
        }}
      />
      <Typography use="headline6" tag="h2">
        Face-up cards
      </Typography>
      <ChipSet choice>
        {board.cards.map((card, i) => {
          const selected = activeGame.publicCards.includes(i);
          return (
            <Chip
              key={i}
              label={card.name}
              onInteraction={() =>
                setActiveGame({
                  ...activeGame,
                  publicCards: selected
                    ? activeGame.publicCards.filter((c) => c !== i)
                    : [...activeGame.publicCards, i],
                })
              }
              selected={selected}
            />
          );
        })}
      </ChipSet>
      <Typography use="headline6" tag="h2">
        Me
      </Typography>
      <Select
        enhanced
        options={activeGame.players.map((player, i) => ({
          label: player.name,
          value: i.toString(),
        }))}
        defaultValue={activeGame.me.toString()}
        onChange={(e) => {
          setActiveGame({
            ...activeGame,
            me: parseInt(e.currentTarget.value),
          });
        }}
      />
      <ChipSet choice>
        {board.cards.map((card, i) => {
          const selected = activeGame.myCards.includes(i);
          return (
            <Chip
              key={i}
              label={card.name}
              onInteraction={() =>
                setActiveGame({
                  ...activeGame,
                  myCards: selected
                    ? activeGame.myCards.filter((c) => c !== i)
                    : [...activeGame.myCards, i],
                })
              }
              selected={selected}
            />
          );
        })}
      </ChipSet>
      <div style={{ height: 80 }}>
        <Fab
          icon="archive"
          label="Archive"
          style={{ position: "fixed", right: 16, bottom: 16 }}
          onClick={() => {
            setGameHistory([...gameHistory, activeGame]);
            setActiveGame(null);
          }}
        />
      </div>
    </>
  );
}

function clone<T>(t: T): T {
  return JSON.parse(JSON.stringify(t));
}
