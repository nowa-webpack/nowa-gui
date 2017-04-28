import React, { PropTypes } from 'react';
import { shell } from 'electron';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import i18n from 'i18n';


import ProjectList from '../components/ProjectList/List';
import ProjectDetailPage from './ProjectDetailPage';
import NewProjectPage from './NewProjectPage';

const { Sider } = Layout;

const MainPage = ({ showPage, dispatch, showSideMask }) => {
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
          <Tooltip placement="top" title={i18n('foot.feedback')} >
            <Button type="default" icon="github" shape="circle"
              onClick={() => shell.openExternal('https://github.com/nowa-webpack/nowa-gui/issues/new')}
            />
          </Tooltip>
          <Tooltip placement="top" title={i18n('foot.dingding')} >
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
    </Layout>
  );
};

MainPage.propTypes = {
  showPage: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  showSideMask: PropTypes.bool.isRequired,
};

export default MainPage;
