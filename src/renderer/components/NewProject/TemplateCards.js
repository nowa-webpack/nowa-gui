import React, {Component} from 'react';
import { remote } from 'electron';
import { connect } from 'dva';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Spin from 'antd/lib/spin';
// import Row from 'antd/lib/row';
// import Col from 'antd/lib/col';
import i18n from 'i18n';

const { Header, Content } = Layout;

import TemplateItem from './TemplateItem';


const TemplateCards = ({ templates, loading, dispatch, next }) => {

  const importProject = () => {
    dispatch({
      type: 'project/importProj',
      payload: {
        filePath: null
      }
    });
  };

  return (
    <Spin spinning={loading}>
      { templates.map(item =>
        <TemplateItem key={item.name} data={item} dispatch={dispatch} next={next}/>)
      }
    </Spin>
  );
};

export default TemplateCards;

// <Header className="welcome-header">
//           <Button
//             style={{ float: 'right' }}
//             type="primary"
//             size="default"
//             onClick={importProject}
//           >
//           { i18n('welcome.import.btn') }
//           </Button>
//         </Header>