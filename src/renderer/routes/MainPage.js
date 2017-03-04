import React from 'react';
import { shell } from 'electron';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import i18n from 'i18n';


import ProjectList from '../components/ProjectList/List';
import SettingModal from '../components/SettingModal/Modal';
import ProjectDetailPage from './ProjectDetailPage';
import NewProjectPage from './NewProjectPage';

const { Sider } = Layout;

const MainPage = ({ showPage, dispatch }) => {
  return (
    <Layout>
      <Sider className="ui-sider" width={175}>
        <ProjectList />
        <div className="ui-foot">
          <Tooltip placement="top" title={i18n('foot.set')} >
            <Button type="default" icon="setting" shape="circle"
              onClick={() => dispatch({ type: 'layout/changeStatus', payload: { showSetModal: true } })}
            />
          </Tooltip>
          <Tooltip placement="top" title={i18n('foot.feedback')} >
            <Button type="default" icon="message" shape="circle"
              onClick={() => shell.openExternal('https://github.com/nowa-webpack/nowa-gui/issues/new')}
            />
          </Tooltip>
          <Tooltip placement="top" title={i18n('foot.help')} >
            <Button type="default" icon="question-circle-o" shape="circle"
              onClick={() => shell.openExternal('https://github.com/nowa-webpack/nowa-gui/wiki')}
            />
          </Tooltip>
        </div>
      </Sider>
      { showPage === 2 ? <ProjectDetailPage /> : <NewProjectPage />}
      <SettingModal />
    </Layout>
  );
};

export default MainPage;
