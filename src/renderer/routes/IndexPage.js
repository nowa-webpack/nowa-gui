<<<<<<< HEAD
import React, { PropTypes } from 'react';
import { connect } from 'dva';

import {
  SHUTDOWN_PAGE, PREINIT_PAGE, BOILERPLATE_PAGE, PROJECT_PAGE, WELCOME_PAGE,
  SETTING_PAGE, FEEDBACK_PAGE, IMPORT_STEP1_PAGE, IMPORT_STEP2_PAGE
} from 'const-renderer-nowa';

import ShutdownPage from './ShutdownPage';
import PreinitPage from './PreinitPage';
import MainPage from './MainPage';
import WelcomePage from './WelcomePage';
import SettingPage from './SettingPage';
import FeedbackPage from './FeedbackPage';
import LayoutWrap from '../components/Layout/Wrap';
// import CommandSettingPage from './CommandSettingPage';


const IndexPage = ({ showPage, dispatch }) => {
  let mainbody;

  switch (showPage) {
    case SHUTDOWN_PAGE:
      mainbody = <ShutdownPage />;
      break;
    case PREINIT_PAGE:
      mainbody = <PreinitPage />;
      break;
    case WELCOME_PAGE:
      mainbody = <WelcomePage />;
      break;
    case SETTING_PAGE:
      mainbody = <SettingPage />;
      break;
    // case COMMAND_SETTING_PAGE:
    //   mainbody = <CommandSettingPage />;
      // break;
    case FEEDBACK_PAGE:
      mainbody = <FeedbackPage dispatch={dispatch} />;
      break;
    case IMPORT_STEP1_PAGE:
    case IMPORT_STEP2_PAGE:
    case BOILERPLATE_PAGE:
    case PROJECT_PAGE:
      mainbody = <MainPage />;
      break;
    default:
      mainbody = <div />;
      break;
  }

  return (
    <LayoutWrap>{mainbody}</LayoutWrap>
  );
};

IndexPage.propTypes = {
  showPage: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
=======
import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';

import i18n from 'i18n';

import WelcomePage from './WelcomePage';
import PreInitialPage from './PreInitialPage';
import MainPage from './MainPage';
import SettingPage from './SettingPage';
import LayoutWrap from '../components/Layout/LayoutWrap';


const IndexPage = ({ showPage, version, nowaPreFlag, dispatch, showSideMask }) => {
  let mainbody;

  switch (showPage) {
    case -1:
      // mainbody = <PreInitialPage online={online} dispatch={dispatch} />;
      mainbody = <PreInitialPage dispatch={dispatch} nowaPreFlag={nowaPreFlag} />;
      break;
    case 0:
      mainbody = <WelcomePage version={version} dispatch={dispatch} />;
      break;
    case 1:
    case 2:
      mainbody = <MainPage showPage={showPage} dispatch={dispatch} showSideMask={showSideMask} />;
      break;
    case 3:
      mainbody = <SettingPage dispatch={dispatch} />;
      break;
    default:
      mainbody = <MainPage showPage={showPage} dispatch={dispatch} showSideMask={showSideMask} />;
  }
  return (
    <LayoutWrap>{ mainbody }</LayoutWrap>
  );

};

IndexPage.propTypes = {
  showPage: PropTypes.number.isRequired,
  nowaPreFlag: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  version: PropTypes.string.isRequired,
  showSideMask: PropTypes.bool.isRequired,
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
};

export default connect(({ layout }) => ({
  showPage: layout.showPage,
<<<<<<< HEAD
}))(IndexPage);
=======
  nowaPreFlag: layout.nowaPreFlag,
  version: layout.version,
  showSideMask: layout.showSideMask,
}))(IndexPage);

>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
