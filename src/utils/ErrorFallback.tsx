import { Button } from "@rmwc/button";
import { Typography } from "@rmwc/typography";
import { useActiveGame } from "../storage/game";

interface Props {
  screen: string;
  actions: {
    label: string;
    action: (utils: {
      activeGame: ReturnType<typeof useActiveGame>[0];
      setActiveGame: ReturnType<typeof useActiveGame>[1];
    }) => void;
  }[];
}
export function ErrorFallback(props: Props) {
  const [activeGame, setActiveGame] = useActiveGame();
  const actions = [
    ...props.actions,
    {
      label: "Refresh",
      action: () => {
        // eslint-disable-next-line no-self-assign
        document.location = document.location;
      },
    },
  ];
  return (
    <div style={{ textAlign: "center" }}>
      <Typography use="headline5" tag="h2">
        Error while loading the <em>{props.screen}</em> screen
      </Typography>
      {actions.map((action, i) => {
        return (
          <p>
            <Button
              raised
              label={action.label}
              onClick={() => {
                action.action({ activeGame, setActiveGame });
              }}
            />
          </p>
        );
      })}
    </div>
  );
}
