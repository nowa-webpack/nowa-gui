import React, { PropTypes } from 'react';
<<<<<<< HEAD
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
=======
import { shell, remote } from 'electron';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import Message from 'antd/lib/message';
import i18n from 'i18n';


import ProjectList from '../components/ProjectList/List';
import ProjectDetailPage from './ProjectDetailPage';
import NewProjectPage from './NewProjectPage';

const { Sider } = Layout;
const { utils } = remote.getGlobal('services');


const MainPage = ({ showPage, dispatch, showSideMask }) => {
  if (utils.nowaDiff()) {
    Message.info(i18n('msg.nowaVersionTip'), 10);
  }

  return (
    <Layout>
      <Sider className="ui-sider" width={175}>
        <ProjectList />
        <div className="ui-foot">
          <Tooltip placement="top" title={i18n('foot.set')} >
            <Button type="default" icon="setting" shape="circle"
              onClick={() => dispatch({ type: 'layout/showPage', payload: { toPage: 3 } })}
            />
          </Tooltip>
          <Tooltip placement="top" title={i18n('foot.issue')} >
            <Button type="default" icon="github" shape="circle"
              onClick={() => shell.openExternal('https://github.com/nowa-webpack/nowa-gui/issues/new')}
            />
          </Tooltip>
          <Tooltip placement="top" title={i18n('foot.feedback')} >
            <Button type="default" icon="dingding" shape="circle"
              onClick={() => dispatch({ type: 'layout/changeStatus', payload: { showFeedBackModal: true } })}
            />
          </Tooltip>
          <Tooltip placement="top" title={i18n('foot.help')} >
            <Button type="default" icon="question-circle-o" shape="circle"
              onClick={() => shell.openExternal('https://nowa-webpack.github.io/nowa/')}
            />
          </Tooltip>
        </div>
        { showSideMask && <div className="ui-sider-mask" />}
      </Sider>
      { showPage === 2 ? <ProjectDetailPage /> : <NewProjectPage />}
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
    </Layout>
  );
};

<<<<<<< HEAD
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
=======
MainPage.propTypes = {
  showPage: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  showSideMask: PropTypes.bool.isRequired,
};

export default MainPage;
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
