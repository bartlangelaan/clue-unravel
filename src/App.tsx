import { SimpleTopAppBar, TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import { useState } from "react";
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerSubtitle,
  DrawerContent,
} from "@rmwc/drawer";
import { List, SimpleListItem } from "@rmwc/list";
import "@rmwc/top-app-bar/styles";
import "@rmwc/drawer/styles";
import "@rmwc/list/styles";
import "@rmwc/menu/styles";
import { useCurrentPage } from "./storage/page";
import { ActiveGame } from "./pages/game";
import { HistoryOverview } from "./pages/history-overview";

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useCurrentPage();

  function onDrawerListClick(key: typeof page) {
    return () => {
      setPage(key);
      setDrawerOpen(false);
    };
  }
  return (
    <>
      <Drawer modal open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <DrawerHeader>
          <DrawerTitle>Clue Unravel</DrawerTitle>
          <DrawerSubtitle>Made with &hearts; by Bart</DrawerSubtitle>
        </DrawerHeader>
        <DrawerContent>
          <List>
            <SimpleListItem
              activated={page === "game"}
              text="Active game"
              onClick={onDrawerListClick("game")}
            />
            <SimpleListItem
              activated={page === "games"}
              text="Game history"
              onClick={onDrawerListClick("games")}
            />
          </List>
        </DrawerContent>
      </Drawer>
      <SimpleTopAppBar
        title={
          page === "game"
            ? "Active game"
            : page === "games"
            ? "Game history"
            : "Clue Unravel"
        }
        navigationIcon
        onNav={() => setDrawerOpen(true)}
      />
      <TopAppBarFixedAdjust />
      {page === "game" && <ActiveGame />}
      {page === "games" && <HistoryOverview />}
    </>
  );
}

export default App;
