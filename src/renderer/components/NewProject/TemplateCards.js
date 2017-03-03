import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Spin from 'antd/lib/spin';

import TemplateItem from './TemplateItem';

const TemplateCards = ({ templates, loading, dispatch, next }) => {

  return (
    <Spin spinning={loading}>
      <div className="cards-wrap">
      { templates.map(item =>
        <TemplateItem
          key={item.name}
          data={item}
          dispatch={dispatch}
          next={next}
        />)
      }
      </div>
    </Spin>
  );
};

TemplateCards.propTypes = {
  templates: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  next: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default TemplateCards;
