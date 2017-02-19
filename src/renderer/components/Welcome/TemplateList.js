import React, {Component} from 'react';
import { connect } from 'dva';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Spin from 'antd/lib/spin';
import { remote } from 'electron';
import i18n from 'i18n';

const { Header, Content } = Layout;

import TemplateItem from './TemplateItem';


const List = ({ templates, loading, dispatch }) => {

  const importProject = () => {
    dispatch({
      type: 'project/importProj',
      payload: {
        filePath: null
      }
    });
  };

  return (
    <Layout className="welcome" style={{ background: '#fff' }}>
        <Header className="welcome-header">
          <Button
            style={{ float: 'right' }}
            type="primary"
            size="default"
            onClick={importProject}
          >
          { i18n('welcome.import.btn') }
          </Button>
        </Header>

        <Spin spinning={loading}>
          <Content className="template-wrap">
          { templates.map(item =>
            <TemplateItem key={item.name} data={item} dispatch={dispatch} />)
          }
          </Content>
        </Spin>
      </Layout>
  );
};

export default List;