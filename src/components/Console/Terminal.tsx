import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Console as ConsoleFeeds } from 'console-feed';

import { color, fontsize } from '../../Css';
import { Typography } from '../../atoms';

type Methods = 'log' | 'warn' | 'error' | 'info' | 'debug' | 'time' | 'assert' | 'count' | 'table';
type TerminalMessageType = { method: Methods; data: any[] };
type TerminalMessagesType = TerminalMessageType[];

const Terminal: React.FC<{ terminalMessages: TerminalMessagesType }> = ({ terminalMessages }) => {
  const classes = useStyles();
  return (
    <div className={classes.consoleSection}>
      <div
        className={`${classes.consoleTerminalLogMessages} ${classes.consoleTerminalClearMessage}`}>
        <Typography thickness="regular">Console was cleared</Typography>
      </div>
      <ConsoleFeeds
        logs={terminalMessages}
        variant="dark"
        styles={{ BASE_FONT_FAMILY: 'Eina regular', BASE_FONT_SIZE: '12.5px' }}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  consoleSection: {
    width: '100%',
    height: 'calc(100% - 48px)',
    position: 'relative',
    overflowY: 'scroll',
    borderTop: `1px solid ${color.darkThemeLightBorder}`,
    fontSize: `${fontsize.terminal}px !important`,
  },
  consoleTerminalClearMessage: {
    fontStyle: 'italic',
  },
  consoleTerminalLogMessages: {
    padding: '3px 15px',
    borderBottom: `1px solid ${color.darkThemeLightBorder}`,
    fontSize: `${fontsize.terminal}px !important`,
  },
}));

export default Terminal;
