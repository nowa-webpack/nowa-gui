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
};

export default connect(({ layout }) => ({
  showPage: layout.showPage,
  nowaPreFlag: layout.nowaPreFlag,
  version: layout.version,
  showSideMask: layout.showSideMask,
}))(IndexPage);

