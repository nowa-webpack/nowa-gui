import React, { PropTypes } from 'react';
import Card from 'antd/lib/card';
import Icon from 'antd/lib/icon';
import i18n from 'i18n';

import OfficialItem from './OfficialItem';
import LocalItem from './LocalItem';
import RemoteItem from './RemoteItem';
import CustomTemplate from '../CustomTemplate';

const TemplateCards = ({ 
  officialTemplates, localTemplates, remoteTemplates, dispatch, next
}) => {

  return (
      <div className="cards-wrap">
        
        { officialTemplates.length > 0 
          && officialTemplates.map(item =>
            <OfficialItem
              key={item.name}
              data={item}
              dispatch={dispatch}
              next={next}
            />)
        }
        { remoteTemplates.length > 0
          && remoteTemplates.map(item =>
            <RemoteItem
              key={item.id}
              data={item}
              dispatch={dispatch}
              next={next}
            />)
        }
        { localTemplates.length > 0
          && localTemplates.map(item =>
            <LocalItem
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
        <CustomTemplate />
      </div>
    
  );
};

TemplateCards.propTypes = {
  officialTemplates: PropTypes.array.isRequired,
  localTemplates: PropTypes.array.isRequired,
  remoteTemplates: PropTypes.array.isRequired,
  next: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default TemplateCards;
