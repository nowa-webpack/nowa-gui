import React, { PropTypes, Component } from 'react';
// import { remote } from 'electron';
import Layout from 'antd/lib/layout';
import { connect } from 'dva';

// import i18n from 'i18n-renderer-nowa';
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
// const { mainWin } = remote.getGlobal('services');

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

/*class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      siderWidth: 175,
    };

    this.onWindowResize = this.onWindowResize.bind(this);
  }
  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }
  onWindowResize() {
    const size = mainWin.getSize();
    const middle = size[0] * 0.194;
    let siderWidth = 175;
    if (middle > 175) {
      siderWidth = middle > 250 ? 250 : middle;
    }
    this.setState({ siderWidth });
  }

  render() {
    const { dispatch } = this.props;
    const { siderWidth } = this.state;
    return (
      <Layout className="main">
        <Sider className="main-sider" width={175}>
          <ProjectList />
          <SiderFoot dispatch={dispatch} />
        </Sider>
        <BoilerplatePage />
      </Layout>
    );
  }
};*/

/*<Sider>dd</Sider>
<Sider className="main-sider" style={{
        flex: '0 0 auto',
        width: '18%',
        'max-width': 250,
        'min-width': 176,
      }}>dd</Sider>*/


MainPage.propTypes = {
  showPage: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  // showSideMask: PropTypes.bool.isRequired,
};

export default connect(({ layout }) => ({
  showPage: layout.showPage,
  // showSideMask: layout.showSideMask,
}))(MainPage);