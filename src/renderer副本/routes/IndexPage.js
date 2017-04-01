import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';

import i18n from 'i18n';

import WelcomePage from './WelcomePage';
import PreInitialPage from './PreInitialPage';
import MainPage from './MainPage';
import LayoutWrap from '../components/Layout/LayoutWrap';


const IndexPage = ({ showPage, online, version, dispatch }) => {
  let mainbody;

  switch (showPage) {
    case -1:
      mainbody = <PreInitialPage online={online} dispatch={dispatch} />;
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
  online: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  version: PropTypes.string.isRequired,
};

export default connect(({ layout }) => ({
  showPage: layout.showPage,
  online: layout.online,
  version: layout.version,
}))(IndexPage);

