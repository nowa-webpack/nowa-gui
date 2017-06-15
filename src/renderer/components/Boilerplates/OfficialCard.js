import React, { Component, PropTypes } from 'react';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Spin from 'antd/lib/spin';

import i18n from 'i18n-renderer-nowa';
import { hideBoilerplateDesp, openUrl } from 'util-renderer-nowa';

const InputGroup = Input.Group;

class Item extends Component {
  constructor(props) {
    super(props);
    const { data } = props;
    const tag = data.defaultTag;
    this.state = {
      tag,
      shouldUpdate: data.tags.filter(item => item.name === tag)[0].update,
    };
  }

  changeTag(tag) {
    const { data: { tags } } = this.props;
    const shouldUpdate = tags.filter(item => item.name === tag)[0].update;
    this.setState({ tag, shouldUpdate });
  }

  updateBoilerplate() {
    const { dispatch, data, type } = this.props;
    const { tag } = this.state;
    dispatch({
      type: 'boilerplate/updateOffical',
      payload: {
        name: data.name,
        item: data.tags.filter(item => item.name === tag)[0],
        // tag: this.state.tag,
        type
      }
    });
    this.setState({ shouldUpdate: false });
  }

  handleCreate() {
    const { dispatch, data, type } = this.props;
    const { tag } = this.state;
    dispatch({
      type: 'boilerplate/download',
      payload: {
        type,
        item: data.tags.filter(item => item.name === tag)[0],
        name: data.name,
      }
    });
  }

  render() {
    const { data } = this.props;
    const { shouldUpdate, tag } = this.state;

    return (
      <div className="boilerplate-card boilerplate-card-official" >
        <Spin spinning={data.loading}>
          <div className="boilerplate-card-body">
            <h4 className="boilerplate-card-title">{data.name}</h4>
            <p className="boilerplate-card-description">{hideBoilerplateDesp(data.description)}</p>
            {
              shouldUpdate &&
                <Button
                  type="danger"
                  ghost
                  size="small"
                  className="boilerplate-card-official-update"
                  onClick={() => this.updateBoilerplate()}
                >New {tag.replace('_', '').toUpperCase()}</Button>
            }
          </div>
          <div className="boilerplate-card-foot">
            <InputGroup compact>
              <Button icon="link" className="boilerplate-card-official-opt more"
                onClick={() => openUrl(data.homepage)}
              >{i18n('project.new.more')}</Button>
              <Select
                className="boilerplate-card-official-opt"
                size="large"
                defaultValue={data.defaultTag}
                onChange={value => this.changeTag(value)}
              >
              { data.tags.map(item =>
                  <Select.Option
                    key={item.name}
                    value={item.name}
                  >
                    {i18n('project.new.version')}: {item.name.replace('_', '').toUpperCase()}
                  </Select.Option>)
              }
              </Select>
              <Button
                className="boilerplate-card-official-opt"
                ghost
                type="primary"
                onClick={() => this.handleCreate()}
              >{i18n('project.new.create')}</Button>
            </InputGroup>
          </div>
        </Spin>
      </div>
    );
  }
}

Item.propTypes = {
  data: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

export default Item;
