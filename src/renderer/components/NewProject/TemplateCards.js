import React, { PropTypes } from 'react';
import Card from 'antd/lib/card';
import Icon from 'antd/lib/icon';
import i18n from 'i18n';

import OfficalTemplateItem from './OfficalTemplateItem';
import CustomLocalTemplateItem from './CustomLocalTemplateItem';
import CustomRemoteTemplateItem from './CustomRemoteTemplateItem';
import TemplateModal from '../CustomTemplate/Modal';

const TemplateCards = ({ 
  officalTemplates, localTemplates, remoteTemplates, dispatch, next
}) => {

  return (
      <div className="cards-wrap">
        
        { officalTemplates.length > 0 
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
            <CustomRemoteTemplateItem
              key={item.id}
              data={item}
              dispatch={dispatch}
              next={next}
            />)
        }
        { localTemplates.length > 0
          && localTemplates.map(item =>
            <CustomLocalTemplateItem
              key={item.id}
              data={item}
              dispatch={dispatch}
              next={next}
            />)
        }
        <Card
          className="custom-card"
          bordered={false}
          onClick={() => dispatch({ type: 'init/changeStatus', payload: { showTemplateModal: true } })}
        >
          <div className="card-body">
            <Icon type="plus" />
            <p className="content">{i18n('project.new.addTempldate')}</p>
          </div>
        </Card>
        <TemplateModal />
      </div>
    
  );
};

TemplateCards.propTypes = {
  officalTemplates: PropTypes.array.isRequired,
  localTemplates: PropTypes.array.isRequired,
  remoteTemplates: PropTypes.array.isRequired,
  next: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default TemplateCards;
