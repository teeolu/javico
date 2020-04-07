import React, { useState, useRef } from "react";
import { Paper, Button, Tabs, Tab, withStyles } from "@material-ui/core";
import { OpenInNew as OpenInNewIcon } from "@material-ui/icons";
import { Typography, ButtonWithLoading } from "@javico/common/lib/components";
import {
  useStyles as commonUseStyles,
  color,
  fontsize
} from "@javico/common/lib/design-language/Css";

import { useStyles } from "./styles";
import MarkdownRenderer from "../MarkDownRenderer";

interface IProps {
  onRequestClose: () => void;
  onOk: (comment: string) => void;
  loading: boolean;
  visible: boolean;
  anchorEl: null | HTMLElement;
}

const MuiTabs = withStyles({
  root: {
    minHeight: 0
  },
  indicator: {
    backgroundColor: color.themeBlue,
    height: 2,
    minWidth: 80
  }
})(Tabs);

const MuiTab = withStyles({
  root: {
    color: `${color.gray60} !important`,
    padding: 0,
    minHeight: 31,
    minWidth: 80,
    fontSize: `${fontsize.small}px !important`,
    textTransform: "capitalize !important"
  },
  selected: {
    color: `${color.black} !important`
  }
} as any)(Tab);

function a11yProps(index: number) {
  return {
    id: `inline-comment-tab-${index}`,
    "aria-controls": `inline-comment-tabpanel-${index}`
  };
}

const InlineCodeComment: React.FC<IProps> = ({
  onRequestClose,
  onOk,
  visible,
  anchorEl,
  loading
}) => {
  const [comment, setComment] = useState("");
  const [currentTab, setCurrentTab] = useState(0);
  const [isCommentBoxFocused, setIsCommentBoxFocused] = useState(true);
  const commentRef = useRef<any>(null);
  const commonCss = commonUseStyles();
  const classes = useStyles();

  function handleChange(e: any) {
    setComment(e.target.value);
  }

  function handleTabChange(event: React.ChangeEvent<{}>, currentTab: number) {
    setCurrentTab(currentTab);
  }

  function handleFocusCodeCommentContainer() {
    setIsCommentBoxFocused(true);
  }

  function handleBlurCodeCommentContainer() {
    setIsCommentBoxFocused(false);
  }

  function handleSubmitComment() {
    onOk(comment);
  }

  function renderWriteComment() {
    return (
      <>
        <textarea
          onChange={handleChange}
          required={true}
          value={comment}
          autoFocus={true}
          onFocus={handleFocusCodeCommentContainer}
          onBlur={handleBlurCodeCommentContainer}
          rows={7}
          placeholder="Drop your comment"
        ></textarea>
        <div className="inline-comment__footer">
          <Typography
            variant="a"
            href="https://www.markdownguide.org/basic-syntax/"
            target="_blank"
            className={classes.markdownLink}
          >
            Markdown is supported
            <OpenInNewIcon className={classes.openInNewIcon} />
          </Typography>
          <div className={commonCss.flexRow}>
            <Button className={commonCss.cancelButton} onClick={onRequestClose}>
              Cancel
            </Button>
            <ButtonWithLoading
              loading={loading}
              color="primary"
              variant="contained"
              onClick={handleSubmitComment}
            >
              Comment
            </ButtonWithLoading>
          </div>
        </div>
      </>
    );
  }

  function renderPreviewComment() {
    return comment.length === 0 ? (
      <Typography className={classes.nothingToPreview}>
        Nothing to preview.
      </Typography>
    ) : (
      <MarkdownRenderer source={comment} linkTarget="_blank" />
    );
  }

  return visible === true ? (
    <div
      className={`${classes.commentBoxContainer} ${commonCss.fullHeightAndWidth}`}
    >
      <Paper
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={classes.commentBox}
        style={{
          top: anchorEl === null ? 0 : anchorEl.getBoundingClientRect().top + 20
        }}
      >
        <form
          ref={commentRef}
          onSubmit={e => e.preventDefault()}
          className={commonCss.flexRow}
        >
          <div className={commonCss.fullWidth}>
            <div
              className={`${classes.inlineCommentContainer} ${
                commonCss.relative
              } ${isCommentBoxFocused && commonCss.focused}`}
            >
              <div className="inline-comment__header">
                <MuiTabs
                  value={currentTab}
                  onChange={handleTabChange}
                  aria-label="inline comment tabs"
                >
                  <MuiTab label="Write" {...a11yProps(0)} />
                  <MuiTab label="Preview" {...a11yProps(1)} />
                </MuiTabs>
              </div>
              {currentTab === 0 ? renderWriteComment() : renderPreviewComment()}
            </div>
          </div>
        </form>
      </Paper>
    </div>
  ) : null;
};

export default React.memo(InlineCodeComment);
