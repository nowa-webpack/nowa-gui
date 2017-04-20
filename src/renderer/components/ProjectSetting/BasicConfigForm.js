import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Select from 'antd/lib/select';
import i18n from 'i18n';

import { VERSION_MATCH, NAME_MATCH } from 'gui-const';

class BasicConfigForm extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitState(props.project.pkg, props.project.registry);
  }

  componentWillReceiveProps({ project, path }) {
    if (path !== this.props.project.path) {
      this.setState(this.getInitState(project.pkg, project.registry));
    }
  }

  getInitState(pkg, registry) {
    const state = {
      name: pkg.name || 'UNTITLED',
      author: pkg.author || '',
      description: pkg.description || '',
      version: pkg.version || '1.0.0',
      // version: typeof pkg.version === 'undefined' ? '1.0.0' : pkg.version,
      repo: typeof pkg.repository === 'undefined' ? '' : pkg.repository.url,
      homepage: typeof pkg.homepage === 'undefined' ? '' : pkg.homepage,
      license: typeof pkg.license === 'undefined' ? 'MIT' : pkg.license,
      registry: typeof registry === 'undefined' ? '' : registry,
    };

    return state;
  }

  handleSubmit() {
    const { dispatch, project } = this.props;
    const { repo, registry, ...others } = this.state;

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
      payload: { pkg, project, registry }
    });
    Message.success(i18n('msg.updateSuccess'));
  }
 
  render() {
    const { registryList } = this.props;
    const { name, author, version, description, repo, homepage, license, registry } = this.state;

    return (
      <form className="setting-form" >
        <div className="setting-form-item sm">
          <label className="setting-form-label">Name:</label>
          <input type="text"
            onChange={e => this.setState({ name: e.target.value })}
            value={name}
          />
        </div>
        <div className="setting-form-item sm">
          <label className="setting-form-label">Author:</label>
          <input type="text"
            onChange={e => this.setState({ author: e.target.value })}
            value={author}
          />
        </div>
        <hr className="setting-form-hr" />
        <div className="setting-form-item sm">
          <label className="setting-form-label">Version:</label>
          <input type="text"
            onChange={e => this.setState({ version: e.target.value })}
            value={version}
          />
        </div>
        <div className="setting-form-item sm">
          <label className="setting-form-label">License:</label>
          <input type="text"
            onChange={e => this.setState({ license: e.target.value })}
            value={license}
          />
        </div>
        <hr className="setting-form-hr" />
        <div className="setting-form-item lg">
          <label className="setting-form-label">Registry:</label>
          <Select
            mode="combobox"
            style={{ width: 495 }}
            value={registry}
            onChange={value => this.setState({ registry: value })}
          >
            {registryList.map(item => 
              <Select.Option value={item} key={item}>{item}</Select.Option>)}
          </Select>
        </div>
        <hr className="setting-form-hr" />
        <div className="setting-form-item lg">
          <label className="setting-form-label">Description:</label>
          <input type="text"
            onChange={e => this.setState({ description: e.target.value })}
            value={description}
          />
        </div>
        <hr className="setting-form-hr" />
        <div className="setting-form-item lg">
          <label className="setting-form-label">Repository:</label>
          <input type="text"
            onChange={e => this.setState({ repo: e.target.value })}
            value={repo}
          />
        </div>
        <hr className="setting-form-hr" />
        <div className="setting-form-item lg">
          <label className="setting-form-label">Homepage:</label>
          <input type="text"
            onChange={e => this.setState({ homepage: e.target.value })}
            value={homepage}
          />
        </div>
        <hr className="setting-form-hr" />
        
        <div className="setting-form-btns">
          <Button type="primary" size="default" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
        </div>
      </form>
    );
  }
}

// defaultValue={registry}

// <input type="text"
//             onChange={e => this.setState({ registry: e.target.value })}
//             value={registry}
//           />

BasicConfigForm.propTypes = {
  project: PropTypes.shape({
    pkg: PropTypes.object,
    path: PropTypes.string,
    registry: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  registryList: PropTypes.array.isRequired,
};

export default connect(({ project, setting }) => ({
  project: project.current,
  registryList: setting.registryList,
}))(BasicConfigForm);
