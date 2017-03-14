import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import classNames from 'classnames';
import Button from 'antd/lib/button';
import Card from 'antd/lib/card';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import i18n from 'i18n';

const InputGroup = Input.Group;
const { application } = remote.getGlobal('services');


const Item = ({ data, dispatch, next }) => {
  const removeTemplate = () => {
    application.removeCustonTemplates({ type: 'local', item: data });
  };

  const showModal = () => {
    dispatch({
      type: 'init/changeStatus',
      payload: {
        showTemplateModal: true,
        templateModalTabType: 2,
        editTemplate: data
      }
    });
  };


  return (
    <Card
      className={classNames({
        'template-card': true,
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
            'opt-lg': !data.disable,
            'opt-mx': data.disable,
          })}
          onClick={showModal}
        >{i18n('project.new.edit')}</Button>
        {
          !data.disable &&
            <Button className="opt opt-lg" ghost type="primary"
              onClick={() => {}}
            >{i18n('project.new.create')}</Button>
        }
      </InputGroup>
    </Card>
  );
};

Item.propTypes = {
  data: PropTypes.object.isRequired,
  next: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Item;
