import { ClueBoard } from "../storage/boards";
import { ClueGame } from "../storage/game";
import { cartesianWithLength } from "./cartesian";
import { notEmpty } from "./notEmpty";

interface Certainty {
  player: number | "FACE_UP" | "SOLUTION";
  card: number;
  owner: boolean;
  reason: string;
}

interface GameError {
  message: string;
  relatedActions?: number[];
  relatedCertainties?: number[];
}

export function calculateGame(
  game: ClueGame,
  board: ClueBoard,
  certainties: Certainty[] = [],
  cal = true
) {
  const playerIs = Object.keys(game.players).map((p) => parseInt(p, 10));
  const possiblyUnknownPlayers = [...playerIs, "SOLUTION" as const];
  const possibleOwners = [...possiblyUnknownPlayers, "FACE_UP" as const];
  const errors: GameError[] = [];

  function getCardOwner(cardI: number) {
    return certainties.find((c) => c.card === cardI && c.owner === true);
  }

  function getCardPlayerStatus(cardI: number, playerI: Certainty["player"]) {
    return certainties.find((c) => c.card === cardI && c.player === playerI);
  }

  function markOwner(
    cardI: number,
    playerI: Certainty["player"],
    reason: string
  ) {
    let certainty = getCardPlayerStatus(cardI, playerI);
    if (!certainty) {
      certainty = {
        player: playerI,
        card: cardI,
        owner: true,
        reason,
      };
      certainties.push(certainty);
    }
    return certainty;
  }

  function markNotOwner(
    cardI: number,
    playerI: Certainty["player"],
    reason: string
  ) {
    let certainty = getCardPlayerStatus(cardI, playerI);
    if (!certainty) {
      certainty = {
        player: playerI,
        card: cardI,
        owner: false,
        reason,
      };
      certainties.push(certainty);
    }
    return certainty;
  }

  /**
   * Cards we have ourselves
   */
  game.myCards.forEach((card) => {
    markOwner(card, game.me, "This is my card.");
  });

  if (game.players[game.me].cards !== game.myCards.length) {
    errors.push({
      message: `You should have ${
        game.players[game.me].cards
      } cards, but you have selected ${game.myCards.length} cards.`,
    });
  }

  /**
   * Cards that are faced up
   */
  game.publicCards.forEach((card) => {
    markOwner(card, "FACE_UP", "This is a face-up card.");
  });

  const cardsOfPlayers = Object.values(game.players).reduce(
    (c, p) => c + p.cards,
    0
  );
  if (
    game.publicCards.length !==
    board.cards.length - cardsOfPlayers - board.categories.length
  ) {
    errors.push({
      message: `In total, all players have ${cardsOfPlayers} cards. ${board.categories.length} cards are the solution. There are ${board.cards.length} cards on this board, which means that ${game.publicCards.length} cards should be faced-up (or the amount of cards per player should be changed).`,
    });
  }

  game.actions.forEach((action) => {
    if (action.type === "suggestion") {
      /**
       * Players that did not disprove a card
       */
      const playersNotDisproved = [...playerIs, ...playerIs];

      playersNotDisproved.splice(
        0,
        playersNotDisproved.indexOf(action.player) + 1
      );

      playersNotDisproved.splice(
        playersNotDisproved.indexOf(action.playerDisproved ?? action.player)
      );

      playersNotDisproved.forEach((player) => {
        action.suggestedCards.forEach((card) => {
          const cardStatus = getCardPlayerStatus(card, player);
          if (!cardStatus) {
            markNotOwner(
              card,
              player,
              "When asked for this card, the user did not disprove."
            );
          } else if (cardStatus.owner === true) {
            errors.push({
              message:
                "The user did not disprove this card when asked for it, but we already know the player owns this card.",
              relatedActions: [game.actions.indexOf(action)],
              relatedCertainties: [certainties.indexOf(cardStatus)],
            });
          }
        });
      });

      /**
       * Cards that have been disproved
       */
      if (
        typeof action.playerDisproved === "number" &&
        typeof action.card === "number"
      ) {
        const cardStatus = markOwner(
          action.card,
          action.playerDisproved,
          "When asked for this card, the user showed this card."
        );
        if (cardStatus.owner === false) {
          errors.push({
            message:
              "The user showed this card, but we already know this user does not own this card.",
            relatedActions: [game.actions.indexOf(action)],
            relatedCertainties: [certainties.indexOf(cardStatus)],
          });
        }
      }
    }
  });

  while (true) {
    let certaintiesAtStart = certainties.length;

    board.cards.forEach((_, cardI) => {
      /**
       * If we know a player has this card or it is the solution, we know certain that all other
       * players don't have it.
       */
      const owner = getCardOwner(cardI);
      if (owner) {
        possiblyUnknownPlayers.forEach((playerI) => {
          const cardStatus = markNotOwner(
            cardI,
            playerI,
            "We already know who owns this card, so we also know this player does not own this card."
          );

          if (cardStatus.owner && cardStatus !== owner) {
            errors.push({
              message: "There are two owners for the same card.",
              relatedCertainties: [
                certainties.indexOf(owner),
                certainties.indexOf(cardStatus),
              ],
            });
          }
        });
      } else {
        /**
         * If we know this card is in no position but one, we know that is where the card must be.
         */
        const playersPossiblyOwningCard = possiblyUnknownPlayers.filter(
          (playerI) => !getCardPlayerStatus(cardI, playerI)
        );
        if (playersPossiblyOwningCard.length === 1) {
          const player = playersPossiblyOwningCard[0];
          markOwner(
            cardI,
            player,
            player === "SOLUTION"
              ? "No-one has this card, so it must be the solution."
              : "We already know this card is not the solution and we already know that all other players do not have this card."
          );
        } else if (playersPossiblyOwningCard.length === 0) {
          errors.push({
            message:
              "This card is owned by nobody but is also not the solution.",
            relatedCertainties: possiblyUnknownPlayers.map((playerI) =>
              certainties.indexOf(getCardPlayerStatus(cardI, playerI)!)
            ),
          });
        }
      }
    });

    board.categories.forEach((_, categoryI) => {
      const categoryCards = board.cards
        .map((card, cardI) =>
          card.category === categoryI
            ? { cardI, owner: getCardOwner(cardI) }
            : null
        )
        .filter(notEmpty);

      /**
       * If we know a certain card of this category is the solution, we know
       * that all other cards of the same category are not the solution.
       */

      const categoryCardsSolution = categoryCards.filter(
        (c) => c.owner?.player === "SOLUTION"
      );

      if (categoryCardsSolution.length === 1) {
        categoryCards.forEach(({ cardI }) => {
          markNotOwner(
            cardI,
            "SOLUTION",
            "We already know that another card of this category is the solution, so this card can't be the solution."
          );
        });
      } else if (categoryCardsSolution.length > 1) {
        errors.push({
          message:
            "Multiple cards of the category are not the solution, which is impossible.",
          relatedCertainties: categoryCardsSolution.map((s) =>
            certainties.indexOf(s.owner!)
          ),
        });
      } else {
        /**
         * If we know it's none of the other cards of the same category, we know it is the
         * left over card.
         */
        const categoryCardsPossiblySolution = categoryCards.filter(
          (c) => !c.owner || c.owner.player !== "SOLUTION"
        );

        if (categoryCardsPossiblySolution.length === 1) {
          markOwner(
            categoryCardsPossiblySolution[0].cardI,
            "SOLUTION",
            "All other cards of this category are not the solution, so this card must be the solution."
          );
        } else if (categoryCardsPossiblySolution.length === 0) {
          errors.push({
            message:
              "All cards of the category are not the solution, which is impossible.",
            relatedCertainties: categoryCards.map((s) =>
              certainties.indexOf(s.owner!)
            ),
          });
        }
      }
    });

    /**
     * If a suggestion was disproved by a player, that player has at least one of these
     * cards. If we know that the player doesn't own two cards, the player must own the
     * other card.
     */
    game.actions.forEach((action, actionI) => {
      if (
        action.type !== "suggestion" ||
        typeof action.playerDisproved !== "number"
      )
        return;

      const playerDisproved = action.playerDisproved;

      const suggestedCards = action.suggestedCards.map((cardI) => ({
        cardI,
        status: getCardPlayerStatus(cardI, playerDisproved),
      }));

      const possiblyShownCards = suggestedCards.filter(
        (c) => !c.status || c.status.owner === true
      );

      if (possiblyShownCards.length === 1) {
        markOwner(
          possiblyShownCards[0].cardI,
          action.playerDisproved,
          "The player disproved a suggestion, and we know the other cards are not owned by this player."
        );
      }
      if (possiblyShownCards.length === 0) {
        errors.push({
          message:
            "The user disproved one of the cards, but we know that the user has none of them.",
          relatedActions: [actionI],
          relatedCertainties: suggestedCards.map((c) =>
            certainties.indexOf(c.status!)
          ),
        });
      }
    });

    game.players.forEach((player, playerI) => {
      /**
       * If we already know all the cards of someone, we know the player doesn't have any
       * other cards.
       */
      const playerOwnsCertainties = certainties.filter(
        (c) => c.player === playerI && c.owner === true
      );
      if (playerOwnsCertainties.length >= player.cards) {
        board.cards.forEach((_, cardI) => {
          markNotOwner(
            cardI,
            playerI,
            "We already know all cards this user has, so it cannot have this card."
          );
        });
      }
      if (playerOwnsCertainties.length > player.cards) {
        errors.push({
          message: `We know that the player has ${playerOwnsCertainties.length} while this player should have only ${player.cards} cards.`,
          relatedCertainties: playerOwnsCertainties.map((c) =>
            certainties.indexOf(c)
          ),
        });
      }

      /**
       * If we already know enough cards that someone doesn't have, we know the player
       * owns the remaining cards.
       */
      const playerDoesntOwnCertainties = certainties.filter(
        (c) => c.player === playerI && c.owner === false
      );
      const playerDoesntOwnCards = board.cards.length - player.cards;
      if (playerDoesntOwnCertainties.length >= playerDoesntOwnCards) {
        board.cards.forEach((_, cardI) => {
          markOwner(
            cardI,
            playerI,
            "We already know that this user does not have any other card, so it must have this card."
          );
        });
      }
      if (playerDoesntOwnCertainties.length > playerDoesntOwnCards) {
        errors.push({
          message: `We know that the player doesn't have ${playerDoesntOwnCertainties.length} cards for sure, while this player should not have ${playerDoesntOwnCards} cards.`,
          relatedCertainties: playerDoesntOwnCertainties.map((c) =>
            certainties.indexOf(c)
          ),
        });
      }
    });

    if (certaintiesAtStart === certainties.length) {
      break;
    }
  }

  const countPerCardPerPlayer = board.cards.map(() => {
    return Object.fromEntries(
      possibleOwners.map((playerI) => {
        return [playerI, 0];
      })
    );
  });

  /**
   * If we have 0 erors, we can go over all possibilities and check what the chances are
   * that a certain player has a certain card.
   */
  if (errors.length === 0) {
    const allUnfilteredPossiblities = board.cards.map((card, cardI) => {
      const certainOwner = getCardOwner(cardI);
      if (certainOwner) return [certainOwner.player];

      return possiblyUnknownPlayers.filter(
        (playerI) => !getCardPlayerStatus(cardI, playerI)
      );
    });

    const [
      possibilitiesGenerator,
      amountOfUnfilteredPossibilities,
    ] = cartesianWithLength(...allUnfilteredPossiblities);

    console.log(
      `There are ${amountOfUnfilteredPossibilities} possibilities (unfiltered)`
    );

    if (
      amountOfUnfilteredPossibilities > 1 &&
      amountOfUnfilteredPossibilities < 1000 &&
      cal
    ) {
      console.time("Calculating possibilities");
      let amountOfPossibilities = 0;

      for (const possibility of possibilitiesGenerator) {
        const calculatedPossibility = calculateGame(
          game,
          board,
          possibility.map((playerI, cardI) => ({
            player: playerI,
            card: cardI,
            owner: true,
            reason: "Checking for possibilities",
          })),
          false
        );
        if (calculatedPossibility.errors.length) {
          continue;
        }

        // We can now 'count' this possiblity
        amountOfPossibilities += 1;
        possibility.forEach((playerI, cardI) => {
          countPerCardPerPlayer[cardI][playerI] += 1;
        });
      }

      console.timeEnd("Calculating possibilities");

      console.log(
        "Out of",
        amountOfUnfilteredPossibilities,
        "possibilities, ",
        amountOfPossibilities,
        "were legit. Stats:"
      );
      console.table(countPerCardPerPlayer);

      countPerCardPerPlayer.forEach((countPerPlayer, cardI) => {
        const playerI = Object.keys(countPerPlayer).find(
          (playerI) => countPerPlayer[playerI] === amountOfPossibilities
        );
        if (typeof playerI !== "undefined") {
          markOwner(
            cardI,
            playerI === "SOLUTION" || playerI === "FACE_UP"
              ? playerI
              : parseInt(playerI),
            "This is the only possibility, by going over all possibilities."
          );
        }
      });
    }
  }

  return {
    certainties,
    solution: certainties
      .filter((c) => c.player === "SOLUTION" && c.owner === true)
      .map((c) => c.card),
    notSolution: certainties
      .filter(
        (c) =>
          (c.player !== "SOLUTION" && c.owner === true) ||
          (c.player === "SOLUTION" && c.owner === false)
      )
      .map((c) => c.card),
    errors,
    countPerCardPerPlayer,
  };
}

/**
 *
 */
