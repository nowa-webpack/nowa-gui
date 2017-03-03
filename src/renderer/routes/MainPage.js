import React from 'react';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import { shell } from 'electron';

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
          <Button type="default" icon="setting" shape="circle"
            onClick={() => dispatch({ type: 'layout/changeStatus', payload: { showSetModal: true } })}
          />
          <Button type="default" icon="message" shape="circle"
            onClick={() => shell.openExternal('https://github.com/nowa-webpack/nowa-gui/issues/new')}
          />
          <Button type="default" icon="question-circle-o" shape="circle"
            onClick={() => shell.openExternal('https://github.com/nowa-webpack/nowa-gui/wiki')}
          />
        </div>
      </Sider>
      { showPage === 2 ? <ProjectDetailPage /> : <NewProjectPage />}
      <SettingModal />
    </Layout>
  );
};

export default MainPage;
