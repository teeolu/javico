import React, { useState, useEffect } from "react";
import { Tooltip, Menu, MenuItem, Button, Avatar } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Search as SearchIcon,
  Share as ShareoptionIcon,
  GitHub as GitHubIcon,
  // WbIncandescent as WbIncandescentIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from "@material-ui/icons";
import {
  useStyles as commonUseStyles,
  color
} from "@javico/common/lib/design-language/Css";
import {
  IBannerStyle,
  withNotificationBanner,
  IDuration
} from "@javico/common/lib/components/NotificationBanner";
import { Apis } from "@javico/common/lib/utils/Apis";
import { getSourceCodeIdFromUrl } from "@javico/common/lib/utils/UrlUtils";

import { useStyles } from "./styles";
import ShareIcon from "./ShareIcon";
import { SET_CURRENT_USER, LOGOUT_REQUEST } from "../../redux/auth/actionTypes";
import { getCurrentUserState } from "../../redux/auth/reducers";

interface IProps {
  onSetNotificationSettings: (
    text: string,
    style?: IBannerStyle,
    duration?: IDuration
  ) => null;
}

const doc: any = window.document;
const docEl: any = doc.documentElement;

const requestFullScreen =
  docEl.requestFullscreen ||
  docEl.mozRequestFullScreen ||
  docEl.webkitRequestFullScreen ||
  docEl.msRequestFullscreen;
const cancelFullScreen =
  doc.exitFullscreen ||
  doc.mozCancelFullScreen ||
  doc.webkitExitFullscreen ||
  doc.msExitFullscreen;
const fullScreenEnabled =
  doc.fullscreenElement ||
  doc.mozFullscreenElement ||
  doc.webkitFullscreenElement ||
  doc.msFullscreenElement;

const iconList = (fullScreenMode: boolean) => [
  { text: "Search file", action: "", icon: SearchIcon },
  {
    text: fullScreenMode === false ? "Make full screen" : "Resize screen",
    action: "toggleFullScreen",
    icon: fullScreenMode === false ? FullscreenIcon : FullscreenExitIcon
  },
  { text: "Share code", action: "toggleCodeOptions", icon: ShareoptionIcon },
  { text: "Sign in", action: "signInWithGithub", icon: GitHubIcon }
  // { text: "Light theme", action: "", icon: WbIncandescentIcon }
];

const shareOptionsList = [
  {
    name: "twitter",
    color: color.themeBlue,
    text: "Share to twitter",
    iconName: "logo-twitter"
  },
  {
    name: "copy",
    color: "#757575",
    text: "Copy sourcecode link",
    iconName: "ios-copy"
  }
];

const MenuBar: React.FC<IProps> = ({ onSetNotificationSettings }) => {
  const currentUser = useSelector(getCurrentUserState);
  const [fullScreenMode, setFullScreenMode] = useState<boolean>(
    !!fullScreenEnabled
  );
  const [showShareOptions, setShowShareOptions] = useState<boolean | null>(
    null
  );
  const [menuElement, setMenuElement] = React.useState<null | HTMLElement>(
    null
  );
  // const [currentUser, setCurrentUser] = React.useState<any>(null);
  const classes = useStyles();
  const commonCss = commonUseStyles();
  const dispatch = useDispatch();

  console.log("hbkfhjbkjhbkhjbhjjfbfjh ", currentUser);

  useEffect(() => {
    window.addEventListener("resize", function() {
      if (window.screen.height !== window.innerHeight) {
        setFullScreenMode(false);
      }
    });

    Apis.users.onAuthStateChanged(function(user: any) {
      if (user) {
        // setCurrentUser(user);
        Apis.users.fetchUserFromDB({ params: { ID: user.uid } }).then(user => {
          dispatch({ type: SET_CURRENT_USER, payload: user });
        });
      }
    });

    return () => {
      window.removeEventListener("resize", () => null);
    };
  }, []);

  function handleOpenMenu(event: React.MouseEvent<HTMLElement>) {
    setMenuElement(event.currentTarget);
  }

  function handleCloseMenu() {
    setMenuElement(null);
  }

  function handleToggleFullScreen() {
    if (fullScreenMode === false) {
      requestFullScreen.call(docEl).then(() => setFullScreenMode(true));
    } else {
      if (cancelFullScreen) {
        cancelFullScreen.call(doc).then(() => setFullScreenMode(false));
      }
    }
  }

  function handleSignInWithGithub() {
    Apis.users
      .signInWithGithub()
      .then(function(user: any) {
        /**
         * @todo
         * Save the users code in firestore
         */
        dispatch({
          type: SET_CURRENT_USER,
          payload: user
        });
      })
      .catch(function(error: any) {
        onSetNotificationSettings(error.message, "danger", "long");
      });
  }

  function handleLogout() {
    Apis.users
      .logout()
      .then(function() {
        handleCloseMenu();
        dispatch({
          type: LOGOUT_REQUEST
        });
      })
      .catch(function(error: any) {
        onSetNotificationSettings(error.message, "danger", "long");
      });
  }

  function handleShowShareOptions() {
    setShowShareOptions(!showShareOptions);
  }

  function triggerAction(action: string) {
    switch (action) {
      case "toggleFullScreen":
        handleToggleFullScreen();
        break;
      case "signInWithGithub":
        handleSignInWithGithub();
        break;
      case "toggleCodeOptions":
        handleShowShareOptions();
        break;
      default:
        break;
    }
  }

  return (
    <section className={`${classes.menubarContainer} ${commonCss.flexColumn}`}>
      {!!currentUser === true && (
        <Avatar
          src={currentUser.photoURL}
          component={Link}
          to={`/${currentUser.username}`}
          alt="Current User"
          style={{ marginTop: 24 }}
          className={classes.menubarUser}
        />
      )}
      {/* <Menu
        id="current-user-menu"
        anchorEl={menuElement}
        keepMounted
        open={Boolean(menuElement)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu> */}
      {iconList(fullScreenMode).map(el => {
        if (el.text === "Share code" && !getSourceCodeIdFromUrl()) return null;
        if (el.text === "Sign in" && !!currentUser === true) return null;
        const IconComponent = el.icon;

        return (
          <div key={el.text} style={{ position: "relative" }}>
            <div
              className={`${commonCss.flexRow} ${commonCss.center} ${classes.menubarIcon}`}
              onClick={() => triggerAction(el.action)}
            >
              <Tooltip
                title={el.text}
                leaveDelay={300}
                placement="bottom"
                enterDelay={100}
              >
                <span className={commonCss.flexRow}>
                  <IconComponent />
                </span>
              </Tooltip>
            </div>
            {el.action === "toggleCodeOptions" &&
              shareOptionsList.map((el, i) => {
                return (
                  <ShareIcon
                    key={i}
                    index={i}
                    iconName={el.iconName}
                    color={el.color}
                    text={el.text}
                    showShareOptions={showShareOptions}
                    onSetNotificationSettings={onSetNotificationSettings}
                    onHandleShowShareOptions={handleShowShareOptions}
                  />
                );
              })}
          </div>
        );
      })}
      {!!currentUser && (
        <Avatar
          src={currentUser.photoURL}
          component={Link}
          to={`/${currentUser.username}`}
          style={{ marginTop: "auto", marginBottom: 24 }}
          alt="Current User"
          className={classes.menubarUser}
        />
      )}
    </section>
  );
};

export default React.memo(withNotificationBanner(MenuBar));
