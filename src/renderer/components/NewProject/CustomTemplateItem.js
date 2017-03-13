import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import Button from 'antd/lib/button';
import Card from 'antd/lib/card';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import classNames from 'classnames';
import i18n from 'i18n';

const InputGroup = Input.Group;
const { application } = remote.getGlobal('services');


const Item = ({ data, type, dispatch, next }) => {

  const updateTemplate = () => {
    application.updateCustomTemplates(data);
  };

  const removeTemplate = () => {
    application.removeCustonTemplates({ type, item: data });
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
          'opt-lg': data.disable
        })}
        onClick={() => {}}
      >{i18n('project.new.edit')}</Button>
      { type === 'remote' &&
        <Button
          className={classNames({
            opt: true,
            'opt-lg': data.disable
          })}
          onClick={updateTemplate}
        >{ data.disable ? i18n('project.new.retry') : i18n('project.new.update')}</Button>
      }
      { !data.disable &&
        <Button
          className={classNames({
            opt: true,
            'opt-lg': data.disable
          })} ghost type="primary"
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
  type: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Item;
