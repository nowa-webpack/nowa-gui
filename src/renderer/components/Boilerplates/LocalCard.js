import React, { PropTypes } from 'react';
import Button from 'antd/lib/button';
import classNames from 'classnames';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import i18n from 'i18n-renderer-nowa';
import { hideBoilerplateDesp } from 'util-renderer-nowa';

const InputGroup = Input.Group;

const Item = ({ data, dispatch }) => {
  const removeBoilerplate = () => dispatch(
    {
      type: 'boilerplate/remove',
      payload: {
        type: 'local',
        item: data
      }
    });
  

  const showModal = () => {
    dispatch({
      type: 'boilerplate/changeStatus',
      payload: {
        showAddBoilerplateModal: true,
        addOrEditBoilerplateType: 'local',
        editLocalBoilplateData: data
      }
    });
  };

  const handleCreate = () => {
    dispatch({
      type: 'projectCreate/selectBoilerplate',
      payload: {
        type: 'local',
        item: data,
      }
    });
    // next();
  };
  return (
    <div
      className={classNames({
        'boilerplate-card': true,
        'boilerplate-card-custom': true,
        'boilerplate-card-disable': data.disable
      })}
    >
      <Icon type="close" className="boilerplate-card-close" onClick={removeBoilerplate} />
      <div className="boilerplate-card-body">
        <h4 className="boilerplate-card-title">{data.name}</h4>
        <p className="boilerplate-card-description">{
          data.disable ? i18n('msg.LinkInvalidation')
          : hideBoilerplateDesp(data.description)}</p>
      </div>
      <InputGroup compact>
        <Button
          className={classNames({
            'boilerplate-card-local-opt': true,
            'opt-lg': data.disable,
          })}
          onClick={showModal}
        >{i18n('project.new.edit')}</Button>
        {
          !data.disable &&
            <Button className="boilerplate-card-local-opt" ghost type="primary"
              onClick={handleCreate}
            >{i18n('project.new.create')}</Button>
        }
      </InputGroup>
    </div>
  );
}

Item.propTypes = {
  data: PropTypes.object.isRequired,
  // next: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Item;