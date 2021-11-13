import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableContent,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
} from "@rmwc/data-table";
import { Fragment } from "react";
import { ClueBoard } from "../../storage/boards";
import { ClueGame, useActiveGame } from "../../storage/game";
import { ErrorFallback } from "../../utils/ErrorFallback";
import { Icon } from "@rmwc/icon";
import styles from "./sheet.module.css";
import { useGameCalculator } from "../../providers/game-calculator";
import { Avatar } from "@rmwc/avatar";
import { purpleAvatar } from "../../utils/avatarStyles";

interface Props {
  board: ClueBoard;
  activeGame: ClueGame;
  setActiveGame: ReturnType<typeof useActiveGame>[1];
}
export function ActiveGameSheet(props: Props) {
  const { board, activeGame } = props;

  const { calculatedActiveGame: calculation } = useGameCalculator();

  if (!calculation) throw new Error("There is no calculation available.");

  return (
    <>
      <DataTable>
        <DataTableContent>
          <DataTableHead>
            <DataTableRow>
              <DataTableHeadCell>Card</DataTableHeadCell>
              {activeGame.players.map((player, playerI) => (
                <DataTableHeadCell key={playerI}>
                  <Avatar name={player.name} style={purpleAvatar} />
                </DataTableHeadCell>
              ))}
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {board.categories.map((category, categoryI) => (
              <Fragment key={categoryI}>
                <DataTableRow>
                  <DataTableHeadCell>{category}</DataTableHeadCell>
                  {activeGame.players.map((_, playerI) => (
                    <DataTableCell key={playerI}></DataTableCell>
                  ))}
                </DataTableRow>
                {board.cards.map((card, cardI) =>
                  card.category !== categoryI ? null : (
                    <DataTableRow key={cardI}>
                      <DataTableCell
                        className={
                          calculation.solution.includes(cardI)
                            ? styles.solution
                            : calculation.notSolution.includes(cardI)
                            ? styles.notSolution
                            : undefined
                        }
                      >
                        {card.name}
                      </DataTableCell>
                      {activeGame.players.map((_, playerI) => {
                        const certainty = calculation.certainties.find(
                          (c) => c.player === playerI && c.card === cardI
                        );
                        return (
                          <DataTableCell key={playerI}>
                            {certainty?.owner === true ? (
                              <Icon icon="check" />
                            ) : certainty?.owner === false ? (
                              <Icon icon="close" />
                            ) : activeGame.actions.some(
                                (a) =>
                                  a.type === "suggestion" &&
                                  a.suggestedCards.includes(cardI) &&
                                  a.playerDisproved === playerI &&
                                  typeof a.card === "undefined"
                              ) ? (
                              <Icon icon="priority_high" />
                            ) : activeGame.actions.some(
                                (a) =>
                                  a.type === "suggestion" &&
                                  a.suggestedCards.includes(cardI) &&
                                  a.player === playerI
                              ) ? (
                              <Icon icon="remove" />
                            ) : null}
                          </DataTableCell>
                        );
                      })}
                    </DataTableRow>
                  )
                )}
              </Fragment>
            ))}
          </DataTableBody>
        </DataTableContent>
      </DataTable>
    </>
  );
}

export function ActiveGameSheetFallback() {
  return <ErrorFallback screen="Active game - Sheet" actions={[]} />;
}
