import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import { basename } from 'path';
import fs from 'fs-extra';
import Message from 'antd/lib/message';
import Input from 'antd/lib/input';

import i18n from 'i18n';
import { hidePathString } from 'gui-util';


class Form extends Component {

  constructor(props) {
    super(props);
    this.state = { ...props.data };
  }

  changeData(props) {
    this.setState(props);
    this.props.onChangeData(props);
  }

  selectPath() {
    try {
      const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
      this.changeData({ path: importPath[0], name: basename(importPath[0]) });
    } catch (e) {
      console.log(e);
    }
  }

  componentWillReceiveProps(next){
    if (next.data.name !== this.props.name){
      this.setState({ ...next.data });
    }
  }
  

  render() {
    const { name, description, path } = this.state;

    const pathIcon = <i className="iconfont icon-folder" onClick={() => this.selectPath()} />;

    return (
      <form className="ui-form" >
        <div className="form-item">
          <label className="form-label">{i18n('template.modal.name')}:</label>
          <Input className="lg"
            onChange={e => this.changeData({ name: e.target.value })}
            value={name}
          />
        </div>
        <div className="form-item">
          <label className="form-label">{i18n('template.modal.description')}:</label>
          <Input className="lg"
            onChange={e => this.changeData({ description: e.target.value })}
            value={description}
          />
        </div>
        <div className="form-item">
          <label className="form-label">{i18n('template.modal.local.path')}:</label>
          <div className="form-item-grp">
          <Input addonAfter={pathIcon} value={hidePathString(path, 44)} disabled />
          </div>
        </div>
      </form>
    );
  }
}

Form.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    path: PropTypes.string,
    remote: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  onChangeData: PropTypes.func.isRequired,
};

export default Form;
