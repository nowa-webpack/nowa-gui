import React, { Component, PropTypes } from 'react';
import { shell } from 'electron';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import Card from 'antd/lib/card';
import Input from 'antd/lib/input';
import i18n from 'i18n';

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
  updateTemplate() {
    const { dispatch, data } = this.props;
    dispatch({
      type: 'init/updateTemplate',
      payload: {
        sltTemp: data,
        tag: this.state.tag
      }
    });
    this.setState({ shouldUpdate: false });
  }
  handleCreate() {
    const { dispatch, data, next } = this.props;
    const { tag } = this.state;
    dispatch({
      type: 'init/selectTemplate',
      payload: {
        sltTemp: data,
        sltTag: tag,
      }
    });
    next();
  }
  render() {
    const { data } = this.props;
    const { shouldUpdate, tag } = this.state;
    return (
      <Card
        className="template-card"
        bordered={false}
        title={data.name}
        extra={<span>{data.description}</span>}
      >
      {
        shouldUpdate &&
        <Button
          type="danger"
          size="small"
          className="update-btn"
          onClick={() => this.updateTemplate()}
        >New {tag.replace('_', '').toUpperCase()}</Button>
      }
      <InputGroup compact>
        <Button icon="link" className="opt more"
          onClick={() => shell.openExternal(data.homepage)}
        >{i18n('project.new.more')}</Button>
        <Select
          className="opt"
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
        <Button className="opt" ghost type="primary"
          onClick={() => this.handleCreate()}
        >{i18n('project.new.create')}</Button>
      </InputGroup>
      </Card>
    );
  }
}

Item.propTypes = {
  data: PropTypes.object.isRequired,
  next: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Item;
