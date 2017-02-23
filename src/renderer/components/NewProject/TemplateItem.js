import React, {Component} from 'react';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import Card from 'antd/lib/card';
import i18n from 'i18n';

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
    // dispatch({
    //   type: 'layout/changeStatus',
    //   payload: {
    //     showCreateForm: true,
    //   }
    // });
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
        bordered={true} 
      >
        <div className="card-head">
          <h3>{data.name}</h3>
          <p className="description">{data.description}</p>
        </div>
        <div className="version">
          <label>Version:</label>
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
          >Create</Button>
        </div>
      </Card>
    );
  }
}

export default Item;
/*
<div className="card">
        <img src={data.image} alt="template" />
        <div className="description">{data.description}</div>
        <div className="card-foot">
          <label>Version:</label>
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
                  { item.name }
                </Select.Option>)}
            </Select>
          {
            shouldUpdate && 
            <Button
              type="default"
              size="small"
              className="update-btn"
              onClick={() => this.updateTemplate()}
            >
              <i className="iconfont icon-custom-update" />
            </Button>
          }
          
          <Button
            type="primary"
            size="small"
            className="create-btn"
            onClick={() => this.handleCreate()}
          >
            Create
          </Button>
        </div>
      </div>*/

/*<Button
  type="primary"
  size="small"
  className="create-btn"
  onClick={() => dispatch({
    type: 'init/testTemplate',
    payload: {
      name: `${data.name}-${tag}`,
    }
  })}
>
  test
</Button>*/
