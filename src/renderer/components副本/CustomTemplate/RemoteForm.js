import React, { Component, PropTypes } from 'react';
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

  componentWillReceiveProps({ data }) {
    if (data.name !== this.state.name) {
      this.setState({ ...data });
    }
  }


  render() {
    const { name, description, remote } = this.state;


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
          <label className="form-label">{i18n('template.modal.remote.path')}:</label>
          <Input className="lg" placeholder="url"
            onChange={e => this.changeData({ remote: e.target.value })}
            value={remote}
          />
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
