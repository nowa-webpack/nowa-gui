import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';

import i18n from 'i18n';

import WelcomePage from './WelcomePage';
import PreInitialPage from './PreInitialPage';
import MainPage from './MainPage';
import LayoutWrap from '../components/Layout/LayoutWrap';


const IndexPage = ({ showPage, version, nowaPreFlag, dispatch }) => {
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
      mainbody = <MainPage showPage={showPage} dispatch={dispatch} />;
      break;
    default:
      mainbody = <MainPage showPage={showPage} dispatch={dispatch} />;
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
};

export default connect(({ layout }) => ({
  showPage: layout.showPage,
  nowaPreFlag: layout.nowaPreFlag,
  version: layout.version,
}))(IndexPage);

