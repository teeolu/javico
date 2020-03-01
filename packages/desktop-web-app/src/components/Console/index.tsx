import React, { useState, useEffect, useRef } from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { NotInterested as ClearIcon } from '@material-ui/icons';

import { useStyles } from './styles';
import { withNotificationBanner } from '../../atoms';
import { getSourceCodeIdFromUrl } from '../../utils/UrlUtils';
import { Apis } from '../../utils/Apis';
import SignInViaGithubModal from '../SignInViaGithubModal';
import Terminal from './Terminal';
import Readme from './Readme';
import Preview from './Preview';

function a11yProps(index: number) {
  return {
    id: `console-tab-${index}`,
    'aria-controls': `console-tabpanel-${index}`,
  };
}

type Methods = 'log' | 'warn' | 'error' | 'info' | 'debug' | 'time' | 'assert' | 'count' | 'table';
type TerminalMessageType = { method: Methods; data: any[] };
type TerminalMessagesType = TerminalMessageType[];

const Console: React.FC<{
  sourceCode: string;
  sourceCodeHash: null | number;
  fetchedReadme: string;
  onSetNotificationSettings: any;
  ownerId: string;
  user: any;
}> = ({ sourceCode, sourceCodeHash, ownerId, fetchedReadme, onSetNotificationSettings, user }) => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSignInModalVisible, setIsSignInModalVisible] = useState<boolean>(false);
  const [terminalMessages, setTerminalMessages] = useState<TerminalMessagesType>([]);
  const [readMe, setReadMe] = useState<string>(fetchedReadme);
  const workerRef = useRef<any>(null);
  const classes = useStyles();
  const isAuthorize = !!user ? user.uid === ownerId : false;

  useEffect(() => {
    workerRef.current = new Worker(`${window.location.origin}/CodeEvaluatorWorker.js`);
    workerRef.current.addEventListener('message', function(e: { data: TerminalMessageType }) {
      setTerminalMessages((prevTerminalMessages: TerminalMessagesType) => [
        ...prevTerminalMessages,
        e.data,
      ]);
    });
  }, []);

  useEffect(() => {
    if (!!sourceCodeHash === true) {
      setTerminalMessages([]);
      workerRef.current.postMessage({ sourceCode });
    }
  }, [sourceCodeHash, sourceCode]);

  useEffect(() => {
    setReadMe(fetchedReadme);
  }, [fetchedReadme]);

  function handleTabChange(event: React.ChangeEvent<{}>, currentTab: number) {
    setCurrentTab(currentTab);
  }

  function handleReadMeTextChange(e: any) {
    setReadMe(e.target.value);
  }

  function toggleIsLoading(loading = false) {
    setIsLoading(loading);
  }

  function handleCloseSignInModal() {
    setIsSignInModalVisible(false);
  }

  function handleClearConsole() {
    setTerminalMessages([]);
  }

  function submitReadme() {
    toggleIsLoading(true);
    let me = Apis.users.getCurrentUser();
    if (!me) {
      setIsSignInModalVisible(true);
      return;
    }
    const id = getSourceCodeIdFromUrl();
    Apis.sourceCodes
      .saveSourceCode({
        data: { readme: readMe },
        params: { ID: id },
      })
      .then((res: any) => {
        toggleIsLoading();
      })
      .catch((error: any) => {
        toggleIsLoading();
        onSetNotificationSettings(error.message, 'danger', 'long');
      });
  }

  function renderTerminalBasedActions() {
    return (
      currentTab === 0 && (
        <div className={classes.consoleTerminalBasedActionsContainer}>
          <ClearIcon className={classes.consoleTerminalClearIcon} onClick={handleClearConsole} />
        </div>
      )
    );
  }

  return (
    <section className={classes.console}>
      <div>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="console tabs">
          <Tab label="TERMINAL" {...a11yProps(0)} />
          {isAuthorize && <Tab label="READ ME" {...a11yProps(1)} />}
          <Tab label={isAuthorize ? 'PREVIEW' : 'READ ME'} {...a11yProps(2)} />
        </Tabs>
        {renderTerminalBasedActions()}
      </div>
      <div className={classes.consoleSection}>
        {currentTab === 0 && <Terminal terminalMessages={terminalMessages} />}
        {currentTab === 1 ? (
          isAuthorize ? (
            <Readme
              readMe={readMe}
              onSubmitReadme={submitReadme}
              isLoading={isLoading}
              onHandleReadMeTextChange={handleReadMeTextChange}
            />
          ) : (
            <Preview readMe={readMe} />
          )
        ) : null}
        {currentTab === 2 && <Preview readMe={readMe} />}
      </div>
      <SignInViaGithubModal
        visible={isSignInModalVisible}
        onRequestClose={handleCloseSignInModal}
        onSignInSuccess={submitReadme}
      />
    </section>
  );
};

export default React.memo(withNotificationBanner(Console));