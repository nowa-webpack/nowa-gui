import React, { Component, PropTypes } from 'react';
import { ipcRenderer } from 'electron';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Select from 'antd/lib/select';
import i18n from 'i18n';


class ImportInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      registry: props.project.registry,
    };
    this.startInstall = this.startInstall.bind(this);
  }

  componentWillReceiveProps({ project, }) {
    if (project.path !== this.props.project.path) {
      this.setState({
        registry: project.registry,
      });
    }
  }

  startInstall() {
    const { registry } = this.state;
    const { project, dispatch } = this.props;

    dispatch({
      type: 'project/startInstallImportProject',
      payload: {
        project, newRegistry: registry
      }
    });
  }

  render() {
    const { registryList } = this.props;
    const { registry } = this.state;

    return (
      <div className="proj-detail-info" >
        <h2 className="proj-detail-info-title">{i18n('project.import.title')}</h2>
        <form className="ui-form" >
          <p className="proj-detail-info-cnt">{i18n('project.import.info')}</p>
          <div className="form-item">
            <label className="form-label">Registry:</label>
            <Select
              mode="combobox"
              style={{ width: 250 }}
              value={registry}
              onChange={value => this.setState({ registry: value })}
            >
              {registryList.map(item => 
                <Select.Option value={item} key={item}>{item}</Select.Option>)}
            </Select>
          </div>
          <div className="form-btns">
            <Button type="primary" size="default" onClick={() => this.startInstall()}>{i18n('project.import.install')}</Button>
          </div>
        </form>
      </div>
    );
  }
}

ImportInfo.propTypes = {
  registryList: PropTypes.array.isRequired,
  project: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default ImportInfo;
