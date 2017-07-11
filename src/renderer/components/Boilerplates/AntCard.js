import React, { Component, PropTypes } from 'react';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Spin from 'antd/lib/spin';

import i18n from 'i18n-renderer-nowa';
import { hideBoilerplateDesp, openUrl } from 'util-renderer-nowa';

const InputGroup = Input.Group;

const Item = ({
  data,
  dispatch
}) => {
  const updateBoilerplate = () => dispatch({
    type: 'boilerplate/updateAnt',
    payload: data
  });

  const handleCreate = () => dispatch({
    type: 'boilerplate/download',
    payload: {
      type: 'ant',
      item: data,
      name: data.name
    }
  });

  return (
    <div className="boilerplate-card boilerplate-card-official" >
      <Spin spinning={data.loading}>
        <div className="boilerplate-card-body">
          <h4 className="boilerplate-card-title">{data.name}</h4>
          <p className="boilerplate-card-description">{hideBoilerplateDesp(data.description)}</p>
        </div>
        <div className="boilerplate-card-foot">
          <InputGroup compact>
            <Button icon="link" className="boilerplate-card-official-opt more"
              onClick={() => openUrl(data.homepage)}
            >{i18n('project.new.more')}</Button>
            <Button
              className="boilerplate-card-official-opt"
              onClick={() => updateBoilerplate()}
            >{i18n('project.new.update')}</Button>
            <Button
              className="boilerplate-card-official-opt"
              ghost
              type="primary"
              onClick={() => handleCreate()}
            >{i18n('project.new.create')}</Button>
          </InputGroup>
        </div>
      </Spin>
    </div>
  );
};

Item.propTypes = {
  data: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

export default Item;
