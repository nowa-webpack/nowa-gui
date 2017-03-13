import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Spin from 'antd/lib/spin';
import Card from 'antd/lib/card';
import Icon from 'antd/lib/icon';
import i18n from 'i18n';

import OfficalTemplateItem from './OfficalTemplateItem';
import CustomTemplateItem from './CustomTemplateItem';
import TemplateModal from '../CustomTemplate/Modal';

const TemplateCards = ({ 
  officalTemplates, localTemplates, remoteTemplates, loading, dispatch, next
}) => {
  
  return (
    <Spin spinning={loading}>
      <div className="cards-wrap">
        { officalTemplates.length > 0 && !loading
          && officalTemplates.map(item =>
            <OfficalTemplateItem
              key={item.name}
              data={item}
              dispatch={dispatch}
              next={next}
            />)
        }
        { remoteTemplates.length > 0
          && remoteTemplates.map(item =>
            <CustomTemplateItem
              key={item.id}
              data={item}
              dispatch={dispatch}
              next={next}
              type="remote"
            />)
        }
        { localTemplates.length > 0
          && localTemplates.map(item =>
            <CustomTemplateItem
              key={item.id}
              data={item}
              dispatch={dispatch}
              next={next}
              type="local"
            />)
        }
        <Card
          className="custom-card"
          bordered={false}
          onClick={() => dispatch({ type: 'init/changeStatus', payload: { showTemplateModal: true }})}
        >
          <div className="card-body">
            <Icon type="plus" />
            <p className="content">{i18n('project.new.addTempldate')}</p>
          </div>
        </Card>
        <TemplateModal />
      </div>
    </Spin>
  );
};

TemplateCards.propTypes = {
  officalTemplates: PropTypes.array.isRequired,
  localTemplates: PropTypes.array.isRequired,
  remoteTemplates: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  next: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default TemplateCards;

          // : <div className="empty">{i18n('project.new.empty')}</div>

