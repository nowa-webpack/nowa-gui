import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import classNames from 'classnames';
import Button from 'antd/lib/button';
import Card from 'antd/lib/card';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import Spin from 'antd/lib/spin';
import i18n from 'i18n';

const InputGroup = Input.Group;
const { templatesManager } = remote.getGlobal('services');


const Item = ({ data, dispatch, next }) => {
  const updateTemplate = () => {
    dispatch({
      type: 'init/updateCustomRemoteTemplates',
      payload: {
        item: data
      }
    });
  };

  const removeTemplate = () => {
    templatesManager.custom.remove({ type: 'remote', item: data });
    
    // application.removeCustonTemplates({ type: 'remote', item: data });
  };

  const showModal = () => {
    dispatch({
      type: 'init/changeStatus',
      payload: {
        showTemplateModal: true,
        templateModalTabType: 3,
        editTemplate: data
      }
    });
  };

  const handleCreate = () => {
    dispatch({
      type: 'init/selectTemplate',
      payload: {
        type: 'remote',
        item: data
      }
    });
    next();
  };


  return (
    <div className="template-card">
    <Spin spinning={data.loading}>
      <Card
        className={classNames({
          disable: data.disable
        })}
        bordered={false}
        title={data.name}
        extra={<span>{data.description}</span>}
      >
        <Icon type="close" className="close-btn" onClick={removeTemplate} />
        <InputGroup compact>
          <Button
            className={classNames({
              opt: true,
              'opt-lg': data.disable
            })}
            onClick={showModal}
          >{i18n('project.new.edit')}</Button>
          <Button
            className={classNames({
              opt: true,
              'opt-lg': data.disable
            })}
            onClick={updateTemplate}
          >{ data.disable ? i18n('project.new.retry') : i18n('project.new.update')}</Button>
          { !data.disable &&
            <Button
              className="opt" ghost type="primary"
              onClick={handleCreate}
            >{i18n('project.new.create')}</Button>
          }
        </InputGroup>
      </Card>
    </Spin>
    </div>
  );
};

Item.propTypes = {
  data: PropTypes.object.isRequired,
  next: PropTypes.func.isRequired,
  // type: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Item;
