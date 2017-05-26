import React, { PropTypes } from 'react';
import Button from 'antd/lib/button';
import classNames from 'classnames';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import i18n from 'i18n-renderer-nowa';
import { hideBoilerplateDesp } from 'util-renderer-nowa';

const InputGroup = Input.Group;

const Item = ({
  data,
  dispatch
}) => {
  const updateBoilerplate = () => dispatch({
    type: 'boilerplate/updateRemote',
    payload: data
  });

  const removeBoilerplate = () => dispatch({
    type: 'boilerplate/remove',
    payload: {
      type: 'remote',
      item: data
    }
  });

  const showModal = () => dispatch({
    type: 'boilerplate/changeStatus',
    payload: {
      showAddBoilerplateModal: true,
      addOrEditBoilerplateType: 'remote',
      editRemoteBoilplateData: data
    }
  });

  const handleCreate = () => dispatch({
    type: 'projectCreate/selectBoilerplate',
    payload: {
      type: 'remote',
      item: data,
    }
  });

  return (
    <div
      className={classNames({
        'boilerplate-card': true,
        'boilerplate-card-remote': true,
        'boilerplate-card-disable': data.disable
      })}
    >
      <Spin spinning={data.loading}>
        <Icon type="close" className="boilerplate-card-close" onClick={removeBoilerplate} />
        <div className="boilerplate-card-body">
          <h4 className="boilerplate-card-title">{data.name}</h4>
          <p className="boilerplate-card-description">{hideBoilerplateDesp(data.description)}</p>
        </div>
        <InputGroup compact>
          <Button
            className={classNames({
              'boilerplate-card-remote-opt': true,
              'opt-lg': data.disable
            })}
            onClick={showModal}
          >{i18n('project.new.edit')}</Button>
          <Button
            className={classNames({
              'boilerplate-card-remote-opt': true,
              'opt-lg': data.disable
            })}
            onClick={updateBoilerplate}
          >{ data.disable ? i18n('project.new.retry') : i18n('project.new.update')}</Button>
          { !data.disable &&
            <Button
              className="boilerplate-card-remote-opt"
              ghost
              type="primary"
              onClick={handleCreate}
            >{i18n('project.new.create')}</Button>
          }
        </InputGroup>
      </Spin>
    </div>
  );
};

Item.propTypes = {
  data: PropTypes.object.isRequired,
  // next: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Item;