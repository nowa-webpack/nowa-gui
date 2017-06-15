import React, { PropTypes } from 'react';
import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';

import i18n from 'i18n-renderer-nowa';
import OfficialCard from './OfficialCard';
import LocalCard from './LocalCard';
import RemoteCard from './RemoteCard';
import AntCard from './AntCard';


const Cards = ({
  officialBoilerplates = [],
  localBoilerplates = [],
  remoteBoilerplates = [],
  aliBoilerplates = [],
  antBoilerplates = [],
  dispatch
}) => (
  <div className="boilerplate-cards">
    { remoteBoilerplates.length > 0
      && remoteBoilerplates.map(item =>
        <RemoteCard
          key={item.id}
          data={item}
          dispatch={dispatch}
        />)
    }
    { localBoilerplates.length > 0
      && localBoilerplates.map(item =>
        <LocalCard
          key={item.id}
          data={item}
          dispatch={dispatch}
        />)
    }
    { officialBoilerplates.length > 0
      && officialBoilerplates.map(item =>
        <OfficialCard
          key={`officical-${item.name}`}
          data={item}
          dispatch={dispatch}
          type="official"
        />)
    }
    { aliBoilerplates.length > 0
      && aliBoilerplates.map(item =>
        <OfficialCard
          key={`ali-${item.name}`}
          data={item}
          dispatch={dispatch}
          type="ali"
        />)
    }
    { antBoilerplates.length > 0
      && antBoilerplates.map(item =>
        <AntCard
          key={`ant-${item.name}`}
          data={item}
          dispatch={dispatch}
        />)
    }
    <Tooltip placement="left" title={i18n('project.new.addTempldate')} >
      <div
        className="boilerplate-card-add"
        onClick={() => dispatch({
          type: 'boilerplate/changeStatus',
          payload: { showAddBoilerplateModal: true, addOrEditBoilerplateType: 'new' }
        })}
      ><Icon type="plus" />
      </div>
    </Tooltip>
  </div>
);


Cards.propTypes = {
  officialBoilerplates: PropTypes.array.isRequired,
  aliBoilerplates: PropTypes.array.isRequired,
  localBoilerplates: PropTypes.array.isRequired,
  remoteBoilerplates: PropTypes.array.isRequired,
  antBoilerplates: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Cards;
