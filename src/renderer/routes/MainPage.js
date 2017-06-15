import React, { PropTypes } from 'react';
import Layout from 'antd/lib/layout';
import { connect } from 'dva';

import {
  BOILERPLATE_PAGE, PROJECT_PAGE, IMPORT_STEP1_PAGE, IMPORT_STEP2_PAGE
} from 'const-renderer-nowa';
import SiderFoot from '../components/Layout/SiderFoot';
import ProjectList from '../components/ProjectList/List';
import BoilerplatePage from './BoilerplatePage';
import ProjectPage from './ProjectPage';
import ImportingLog from '../components/ImportSteps/ImportingLog';
import CheckRegistry from '../components/ImportSteps/CheckRegistry';


const { Sider } = Layout;

const MainPage = ({
  showPage,
  dispatch,
}) => {
  let component;
  switch (showPage) {
    case BOILERPLATE_PAGE: {
      component = <BoilerplatePage />;
      break;
    }
    case PROJECT_PAGE: {
      component = <ProjectPage />;
      break;
    }
    case IMPORT_STEP1_PAGE: {
      component = <CheckRegistry />;
      break;
    }
    case IMPORT_STEP2_PAGE: {
      component = <ImportingLog />;
      break;
    }
    // case COMMAND_SETTING_PAGE: {
    //   console.log(1111)
    //   component = <CommandSettingPage />;
    //   break;
    // }
    default:
      component = <div />;
      break;
  } 
  return (
    <Layout className="main">
      <Sider className="main-sider" width={175}>
        <ProjectList />
        <SiderFoot dispatch={dispatch} />
      </Sider>
      { component }
    </Layout>
  );
};


MainPage.propTypes = {
  showPage: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  // showSideMask: PropTypes.bool.isRequired,
};

export default connect(({ layout }) => ({
  showPage: layout.showPage,
  // showSideMask: layout.showSideMask,
}))(MainPage);
