import React, {Component} from 'react';
import { shell } from 'electron';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import Card from 'antd/lib/card';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Badge from 'antd/lib/badge';
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
    const { dispatch, data} = this.props;
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
    const { dispatch, data, next} = this.props;
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
    const { dispatch, data } = this.props;
    const { shouldUpdate, tag } = this.state;
    return (
      <Card 
        className="template-card"
        bordered={false}
        title={data.name}
        extra={<span>data.description</span>}
      >
      {
        shouldUpdate && 
        <Button
          type="danger"
          size="small"
          icon="download"
          className="update-btn"
          onClick={() => this.updateTemplate()}
        >{tag.replace('_', '').toUpperCase()}</Button>
      }
      <InputGroup compact>
        <Button icon="link" className="opt"
          onClick={() => shell.openExternal(data.homepage)}>了解更多</Button>
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
              { `VER: ${item.name.replace('_', '').toUpperCase()}` }
            </Select.Option>)
        }
        </Select>
        <Button className="opt" ghost type="primary"
          onClick={() => this.handleCreate()}>Create</Button>
      </InputGroup>  
      </Card>
    );
  }
}

export default Item;


/*
<div className="card-head">
          <h3>{data.name}</h3>
          <p className="description">{data.description}</p>
        </div>
        <div className="version">
          <label>{i18n('template.version')}:</label>
          <Select
            size="small"
            defaultValue={data.defaultTag}
            onChange={value => this.changeTag(value)}
          >
          { data.tags.map(item =>
              <Select.Option
                key={item.name}
                value={item.name}
              >
                { item.name.replace('_', '') }
              </Select.Option>)
          }
          </Select>
          {
            shouldUpdate && 
            <Button
              type="default"
              size="small"
              className="update-btn"
              shape="circle"
              onClick={() => this.updateTemplate()}
            >
              <i className="iconfont icon-update" />
            </Button>
          }
          <Button
            type="primary"
            size="small"
            className="create-btn"
            onClick={() => this.handleCreate()}
          >{i18n('template.create')}</Button>
        </div>
*/
