import "normalize.css";
import "@rmwc/tabs/styles";
import "@rmwc/typography/styles";
import "@rmwc/button/styles";
import "@rmwc/select/styles";
import "@rmwc/textfield/styles";
import "@rmwc/list/styles";
import "@rmwc/avatar/styles";
import "@rmwc/fab/styles";
import "@rmwc/icon-button/styles";
import "@rmwc/chip/styles";
import "@rmwc/ripple/styles";
import "@rmwc/data-table/styles";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import { LocalItemsProvider } from "./providers/local-items";
import { GameCalculatorProvider } from "./providers/game-calculator";

ReactDOM.render(
  <React.StrictMode>
    <LocalItemsProvider>
      <GameCalculatorProvider>
        <App />
      </GameCalculatorProvider>
    </LocalItemsProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
