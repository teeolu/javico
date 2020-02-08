import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Tooltip, makeStyles, Button } from '@material-ui/core';

import MenuBar from '../../components/MenuBar';
import MonacoEditor from '../../components/MonacoEditor';
import Console from '../../components/Console';
import { color, useStyles as commonUseStyles, padding } from '../../Css';
import { IndeterminateLinearProgress, Icon, withNotificationBanner } from '../../atoms';
import { withApi } from '../../utils/ApiConnector';
import { IBannerStyle, IDuration } from '../../atoms/NotificationBanner';
import SourceCodeService from '../../services/SourceCodeServices';
import { getIdFromUrl, getSourcecodeUrl } from '../../utils/UrlUtils';
import Helmet from 'react-helmet';

const Comments = lazy(() => import('../../components/Comments'));

interface IProps {
  onSetNotificationSettings: (text: string, style?: IBannerStyle, duration?: IDuration) => null;
  Api: any;
}

const Home: React.FC<IProps> = ({ onSetNotificationSettings, Api }) => {
  const [terminalExecutableCode, setTerminalExecutableCode] = useState('');
  const [currentSection, setCurrentSection] = useState<'comments' | 'console'>('console');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [fetchedSourceCode, setFetchedSourceCode] = useState({
    sourceCode: '',
    readme: '',
    ownerId: '',
    title: '',
    sourceCodeId: '',
  });
  const classes = useStyles();
  const commonCss = commonUseStyles();

  useEffect(() => {
    Api.onAuthStateChanged(function(user: any) {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, [Api]);

  useEffect(() => {
    fetchSourceCode(toggleIsLoading(true));
    // eslint-disable-next-line
  }, []);

  function fetchSourceCode(cb: any) {
    if (getIdFromUrl()) {
      SourceCodeService.fetchSourceCode({
        params: { ID: getIdFromUrl() },
      })
        .then(res => {
          const { sourceCode, readme, ownerId, title } = res.data();
          toggleIsLoading();

          setFetchedSourceCode({
            sourceCode,
            readme,
            ownerId,
            title,
            sourceCodeId: res.id,
          });
          cb && cb();
        })
        .catch((error: any) => {
          toggleIsLoading();
          onSetNotificationSettings(error.message, 'danger', 'long');
        });
    } else {
      toggleIsLoading();
    }
  }

  function setSourcecodeOwner(data: any) {
    setFetchedSourceCode({ ...fetchedSourceCode, ...data });
  }

  function handleToggleView() {
    setCurrentSection(currentSection === 'console' ? 'comments' : 'console');
  }

  function toggleIsLoading(loading = false) {
    setisLoading(loading);
  }

  function renderSwitchView() {
    return (
      <Tooltip title="Switch View" placement="left" enterDelay={100}>
        <Button
          color="primary"
          variant="contained"
          onClick={handleToggleView}
          classes={{ root: classes.switchButtonRoot, label: classes.switchButtonLabel }}>
          <Icon name="ios-swap" />
        </Button>
      </Tooltip>
    );
  }

  return (
    <>
      <Helmet>
        <title>{!!fetchedSourceCode.ownerId ? fetchedSourceCode.title : 'Untitled'}.js</title>
        <meta name="description" content="Helmet application" />
        <meta property="og:title" content="Review my sourcecode" />
        <meta
          property="og:image"
          content="https://cdn3.vectorstock.com/i/1000x1000/27/97/github-logo-icon-vector-25322797.jpg"
        />
        <meta property="og:description" content="This is just an example page." />
        <meta property="og:url" content={`${getSourcecodeUrl()}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className={`${classes.relative} ${commonCss.flexRow}`}>
        <div className={classes.linearProgress}>
          <IndeterminateLinearProgress isVisible={isLoading} />
        </div>
        <MenuBar />
        <main className={`${classes.main} ${commonCss.flexRow}`}>
          <MonacoEditor
            onHandleLoading={toggleIsLoading}
            onRunSourceCode={setTerminalExecutableCode}
            onChangeCurrentSection={handleToggleView}
            fetchedSourceCode={fetchedSourceCode.sourceCode}
            ownerId={fetchedSourceCode.ownerId}
            sourceCodeTitle={fetchedSourceCode.title}
            onSetSourcecodeOwner={setSourcecodeOwner}
            user={user}
            sourceCodeId={fetchedSourceCode.sourceCodeId}
            currentSection={currentSection}
            isFetchingSourcecode={isLoading}
            fetchSourceCode={fetchSourceCode}
          />
          <div className={classes.mainRightSection}>
            <div
              className={`${classes.rightSubSection} ${
                currentSection === 'console'
                  ? classes.showRightSubSection
                  : classes.hideRightSubSection
              }`}>
              <Console
                ownerId={fetchedSourceCode.ownerId}
                sourceCode={terminalExecutableCode}
                fetchedReadme={fetchedSourceCode.readme}
                user={user}
              />
            </div>
            <div
              className={`${classes.rightSubSection} ${
                currentSection === 'comments'
                  ? classes.showRightSubSection
                  : classes.hideRightSubSection
              }`}>
              <Suspense fallback={null}>
                <Comments
                  visible={currentSection === 'comments'}
                  sourceCodeId={fetchedSourceCode.sourceCodeId}
                  user={user}
                />
              </Suspense>
            </div>
            {renderSwitchView()}
          </div>
        </main>
      </div>
    </>
  );
};

const useStyles = makeStyles({
  main: {
    width: '100%',
  },
  relative: {
    position: 'relative',
  },
  mainRightSection: {
    flex: 1,
    height: '100%',
    borderLeft: `1px solid ${color.darkThemeLightBorder}`,
    minWidth: '50%',
    backgroundColor: color.darkThemeBlack,
    position: 'relative',
  },
  linearProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  switchButtonRoot: {
    position: 'absolute',
    zIndex: 1000,
    right: 10,
    top: 10,
    minWidth: 50,
    width: 50,
    animationName: `$expandSwitchButton`,
    animationDuration: '2000ms',
    animationIterationCount: 'infinite',
    ...padding(5, 'lr'),
    ...padding(0, 'tb'),
  },
  switchButtonLabel: {
    display: 'flex',
    flexDirection: 'column',
    '& ion-icon': {
      fontSize: 25,
    },
  },
  rightSubSection: {
    position: 'absolute',
    width: '100%',
    transition: 'all 0.6s',
  },
  showRightSubSection: {
    right: '0%',
    opacity: 1,
  },
  hideRightSubSection: {
    right: '-100%',
    opacity: 0,
  },
  '@keyframes expandSwitchButton': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.1)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
});

export default withNotificationBanner(withApi(Home));
