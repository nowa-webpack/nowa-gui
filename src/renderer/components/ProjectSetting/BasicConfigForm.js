import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
// import Popconfirm from 'antd/lib/popconfirm';
import Switch from 'antd/lib/switch';
import classNames from 'classnames';
import i18n from 'i18n';

import { upperFirstCha } from 'gui-util';
import { VERSION_MATCH, NAME_MATCH } from 'gui-const';

class BuildConfigForm extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitState(props.project.pkg);
  }

  componentWillReceiveProps({ project, path }) {
    if (path !== this.props.project.path) {
      this.setState(this.getInitState(project.pkg));
    }
  }

  getInitState(pkg) {
    const state = {
      // name: pkg.name,
      author: pkg.author,
      version: pkg.version,
      description: pkg.description,
      repo: typeof pkg.repository === 'undefined' ? '' : pkg.repository.url,
      homepage: typeof pkg.homepage === 'undefined' ? '' : pkg.homepage,
      license: typeof pkg.license === 'undefined' ? 'MIT' : pkg.license,
    };

    return state;
  }

  handleSubmit() {
    const { dispatch, project } = this.props;
    const { repo, ...others } = this.state;

    if (!(NAME_MATCH.test(others.name))) {
      Message.error(i18n('msg.invalidName'));
      return false;
    }

    if (!(VERSION_MATCH.test(others.version))) {
      Message.error(i18n('msg.invalidVersion'));
      return false;
    }

    const pkg = { ...project.pkg, ...others };
    if (pkg.repository) {
      pkg.repository.url = repo;
    }
    dispatch({
      type: 'project/updatePkg',
      payload: { pkg, project }
    });
    Message.success(i18n('msg.updateSuccess'));
  }
 
  render() {
    const keys = Object.keys(this.state);

    const fields = keys.map(item => (
      <div className="form-item" key={item}>
        <label className="form-label">{ item === 'repo' ? 'Repository' : upperFirstCha(item) }:</label>
        <input type="text" className="lg"
          onChange={e => {
            const state = { ...this.state };
            state[item] = e.target.value;
            this.setState(state);
          }}
          value={this.state[item]}
        />
      </div>
    ));

    return (
      <form className="ui-form" >
        { fields } 
        <div className="form-btns">
          <Button type="primary" size="default" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
        </div>
      </form>
    );
  }
}

BuildConfigForm.propTypes = {
  project: PropTypes.shape({
    pkg: PropTypes.object,
    path: PropTypes.string,
    // name: PropTypes.string,
    // port: PropTypes.string
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project }) => ({ project: project.current }))(BuildConfigForm);
