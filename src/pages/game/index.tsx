import { useState } from "react";
import { TabBar, Tab } from "@rmwc/tabs";
import "@rmwc/tabs/styles";
import { Typography } from "@rmwc/typography";
import "@rmwc/typography/styles";
import { useActiveGame } from "../../storage/game";
import { Button } from "@rmwc/button";
import "@rmwc/button/styles";
import { useBoards } from "../../storage/boards";
import { ActiveGameSettings } from "./settings";
import { ActiveGameAction, ActiveGameActionFallback } from "./action";
import { ErrorBoundary } from "react-error-boundary";
import { ActiveGameHistory, ActiveGameHistoryFallback } from "./history";
import { ActiveGameSheet, ActiveGameSheetFallback } from "./sheet";

export function ActiveGame() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeGame, setActiveGame] = useActiveGame();
  const { boards } = useBoards();
  if (!activeGame) {
    return (
      <div style={{ textAlign: "center" }}>
        <Typography use="body1" tag="p">
          There is not a Clue game active yet.
        </Typography>
        <Typography use="body1">
          <Button
            raised
            onClick={() => {
              setActiveGame({
                date: new Date().getTime(),
                board: 0,
                players: [{ name: "Me", cards: 21 }],
                me: 0,
                myCards: [],
                publicCards: [],
                actions: [],
              });
            }}
          >
            New game
          </Button>
        </Typography>
      </div>
    );
  }
  const board = boards[activeGame.board];

  return (
    <>
      <TabBar
        activeTabIndex={activeTab}
        onActivate={(evt) => setActiveTab(evt.detail.index)}
      >
        <Tab>Settings</Tab>
        <Tab>Action</Tab>
        <Tab>History</Tab>
        <Tab>Sheet</Tab>
      </TabBar>
      {activeTab === 0 ? (
        <ActiveGameSettings
          boards={boards}
          board={board}
          activeGame={activeGame}
          setActiveGame={setActiveGame}
        />
      ) : activeTab === 1 ? (
        <ErrorBoundary FallbackComponent={ActiveGameActionFallback}>
          <ActiveGameAction
            board={board}
            activeGame={activeGame}
            setActiveGame={setActiveGame}
          />
        </ErrorBoundary>
      ) : activeTab === 2 ? (
        <ErrorBoundary FallbackComponent={ActiveGameHistoryFallback}>
          <ActiveGameHistory
            board={board}
            activeGame={activeGame}
            setActiveGame={setActiveGame}
          />
        </ErrorBoundary>
      ) : activeTab === 3 ? (
        <ErrorBoundary FallbackComponent={ActiveGameSheetFallback}>
          <ActiveGameSheet
            board={board}
            activeGame={activeGame}
            setActiveGame={setActiveGame}
          />
        </ErrorBoundary>
      ) : null}
    </>
  );
}
