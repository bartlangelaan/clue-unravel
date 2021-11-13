import { Chip } from "@rmwc/chip";
import { Avatar } from "@rmwc/avatar";
import { ClueBoard } from "../storage/boards";
import { purpleAvatar } from "./avatarStyles";
import { useGameCalculator } from "../providers/game-calculator";
import { useActiveGame } from "../storage/game";

interface Props {
  board: ClueBoard;
  card: number;
  selected?: boolean;
  onInteraction?: () => void;
}

export function ClueCard(props: Props) {
  const card = props.board.cards[props.card];
  const { calculatedActiveGame } = useGameCalculator();
  const owner = calculatedActiveGame?.certainties.find(
    (c) => c.card === props.card && c.owner === true
  );
  const [activeGame] = useActiveGame();
  return (
    <Chip
      selected={props.selected}
      label={card.name}
      icon={
        owner?.player === "SOLUTION" ? (
          <Avatar name={"✅"} style={purpleAvatar} />
        ) : owner?.player === "FACE_UP" ? (
          <Avatar name={""} style={purpleAvatar} />
        ) : owner ? (
          <Avatar
            name={activeGame?.players[owner.player].name || ""}
            style={purpleAvatar}
          />
        ) : (
          <Avatar name={"?"} />
        )
      }
      onInteraction={props.onInteraction}
    />
  );
}
