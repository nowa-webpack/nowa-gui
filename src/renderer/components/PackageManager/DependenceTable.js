import React, { Component, PropTypes } from 'react';
import { remote, ipcRenderer } from 'electron';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Table from 'antd/lib/table';
import Input from 'antd/lib/input';
import Popconfirm from 'antd/lib/popconfirm';
import semver from 'semver';
import { join } from 'path';


import i18n from 'i18n';
import request from 'gui-request';
import { readPkgJson } from 'gui-util';
const { utils, command } = remote.getGlobal('services');
const InputGroup = Input.Group;

const basicColumns = [{
  title: i18n('package.name'),
  dataIndex: 'name',
  key: 'name',
  width: 220,
}, {
  title: i18n('package.current'),
  dataIndex: 'version',
  key: 'version',
  width: 90,
}, {
  title: i18n('package.installed'),
  dataIndex: 'installedVersion',
  key: 'installedVersion',
  width: 90,
}, {
  title: i18n('package.newest'),
  dataIndex: 'netVersion',
  key: 'netVersion',
  width: 90,
}];


class DependenceTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selectedRowKeys: [],
      installDp: '',
      // isNewModule: false
    };

    this.onNewPkgFinished = this.onNewPkgFinished.bind(this);
    this.onUpdatePkgFinished = this.onUpdatePkgFinished.bind(this);
  }

  async componentDidMount() {
    const { type } = this.props;
    this.getVersions(this.props).then((dataSource) => {
      this.setState({ dataSource, loading: false });
    });
    ipcRenderer.on(`new-${type}-installed`, this.onNewPkgFinished);
    ipcRenderer.on(`update-${type}-installed`, this.onUpdatePkgFinished);
  }

  componentWillReceiveProps(next) {
    if (next.filePath !== this.props.filePath) {
      this.setState({ loading: true });
      this.getVersions(next)
        .then((dataSource) => {
          this.setState({ dataSource, loading: false });
        });
    }
  }

  componentWillUnmount() {
    const { type } = this.props;
    ipcRenderer.removeAllListeners(`new-${type}-installed`);
    ipcRenderer.removeAllListeners(`update-${type}-installed`);
  }

  async getVersions({ filePath, source, registry }) {
    const localPkgs = utils.getMoudlesVersion(filePath, source);
    const netPkgs = await this.fetchMoudlesVersion(localPkgs, registry);
    return netPkgs;
  }

  onNewPkgFinished(e, { pkgs, err }) {
    const { dataSource, installDp } = this.state;
    console.log(installDp, pkgs, this.state);
    if (err) {
      Message.error(i18n('msg.installFail'));
      this.setState({ loading: false, installDp: '' });
    } else {
      const { filePath, dispatch, type } = this.props;

      const { version } = readPkgJson(join(filePath, 'node_modules', installDp));
      dataSource.push({
        name: installDp,
        version: `^${version}`,
        installedVersion: version,
        netVersion: version,
        update: false,
      });

      dispatch({
        type: 'project/addPkgModules',
        payload: { version, pkgName: installDp, type }
      });

      Message.success(i18n('msg.installSuccess'));
      this.setState({ loading: false, dataSource, installDp: '' });
    }
  }

  onUpdatePkgFinished(e, { pkgs, err }) {
    const { dataSource } = this.state;
    if (err) {
      Message.error(i18n('msg.updateFailed'));
      this.setState({ loading: false, selectedRowKeys: [] });
    } else {
      const { dispatch, type } = this.props;
      const data = dataSource.map((item) => {
        const filter = pkgs.filter(p => p.name === item.name);
        if (filter.length > 0) {
          item.version = `^${item.netVersion}`;
          item.installedVersion = item.netVersion;
          item.update = false;
        }
        return item;
      });
      dispatch({
        type: 'project/updatePkgModules',
        payload: { pkgs, type }
      });
      Message.success(i18n('msg.updateSuccess'));
      this.setState({ loading: false, dataSource: data, selectedRowKeys: [] });
    }
  }

  /*onReceiveFinished(e, { pkgs, err }) {
    const { dataSource, isNewModule, installDp } = this.state;
      console.log('isNewModule', isNewModule);
    if (!err) {
      const { filePath, dispatch, type } = this.props;
      if (isNewModule) {
        const { version } = readPkgJson(join(filePath, 'node_modules', installDp));

        dataSource.push({
          name: installDp,
          version: `^${version}`,
          installedVersion: version,
          netVersion: version,
          update: false,
        });

        dispatch({
          type: 'project/addPkgModules',
          payload: { version, pkgName: installDp, type }
        });

        Message.success(i18n('msg.installSuccess'));
        this.setState({ loading: false, isNewModule: false, dataSource, installDp: '' });
      } else {
        const data = dataSource.map((item) => {
          const filter = pkgs.filter(p => p.name === item.name);
          if (filter.length > 0) {
            item.version = `^${item.netVersion}`;
            item.installedVersion = item.netVersion;
            item.update = false;
          }
          return item;
        });
        dispatch({
          type: 'project/updatePkgModules',
          payload: { pkgs, type }
        });
        Message.success(i18n('msg.updateSuccess'));
        this.setState({ loading: false, dataSource: data, selectedRowKeys: [] });
      }
    } else {
      if (isNewModule) {
        Message.error(i18n('msg.installFail'));
        this.setState({ loading: false, installDp: '', isNewModule: false });
      } else {
        Message.error(i18n('msg.updateFailed'));
        this.setState({ loading: false, selectedRowKeys: [] });
      }
    }
  }*/

  async fetchMoudlesVersion(modules, registry) {
    const repos = await Promise.all(
        modules.map(({ name }) => request(`${registry}/${name}/latest`))
      );
    const pkgs = modules.map(({ name, version, installedVersion }, i) => {
      const { data, err } = repos[i];
      return {
        name,
        version,
        installedVersion,
        netVersion: err ? installedVersion : data.version,
        update: semver.lt(installedVersion, data.version)
      };
    });
    
    return pkgs;
  }

  getBasicOpt() {
    const { filePath, registry } = this.props;
    return {
      root: filePath,
      registry,
      targetDir: filePath,
      storeDir: join(filePath, '.npminstall'),
      cacheDir: null,
      timeout: 5 * 60000,
    };
  }

  updatelModules() {
    const args = [].slice.call(arguments);
    let pkgs = [];
    const opt = this.getBasicOpt();

    if (args.length) {
      pkgs.push({
        name: args[0].name,
        version: args[0].netVersion
      });
    } else {
      const { dataSource, selectedRowKeys } = this.state;

      pkgs = selectedRowKeys.map((item) => {
        const filter = dataSource.filter(p => p.name === item);
        return {
          name: item,
          version: filter[0].netVersion,
        };
      });
    }
    const options = { ...opt, pkgs };
    command.notProgressInstall({
      options,
      sender: `update-${this.props.type}`
    });
    this.setState({ loading: true });
  }

  removeModules(pkg) {
    const { type, dispatch } = this.props;
    const { dataSource } = this.state;

    const filter = dataSource.filter(item => item.name !== pkg.name);
    dispatch({
      type: 'project/deletePkgModules',
      payload: { pkgName: pkg.name, type }
    });
    this.setState({ dataSource: filter });
  }

  newModule() {
    const { installDp, dataSource } = this.state;
    const filter = dataSource.filter(item => item.name === installDp);

    if (filter.length > 0) {
      Message.info(i18n('msg.existed'));
      return false;
    }

    const options = this.getBasicOpt();
    options.pkgs = [{
      name: installDp,
      version: 'latest',
    }];
    command.notProgressInstall({
      options,
      sender: `new-${this.props.type}`
    });
    // this.setState({ loading: true, isNewModule: true });
    this.setState({ loading: true });
  }

  render() {
    const { loading, selectedRowKeys, dataSource, installDp } = this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRows) => {
        this.setState({ selectedRowKeys: selectedRows });
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (changeRows.length === 0) {
          this.setState({ selectedRowKeys: [] });
        }
      },
      getCheckboxProps: record => ({
        disabled: !record.update,
      }),
    };

    const columns = [...basicColumns, {
      title: i18n('package.action'),
      key: 'action',
      dataIndex: 'update',
      render: (update, record) => (
        <div>
          <Popconfirm
            placement="bottomRight"
            title={i18n('msg.removeTip')}
            onConfirm={() => this.removeModules(record)}
            okText={i18n('form.ok')}
            cancelText={i18n('form.cancel')}
          ><Button className="udt-btn" ghost
            type="danger"
            size="small"
            icon="delete"
          />
          </Popconfirm>
          { update &&
            <Button ghost
              icon="download"
              size="small"
              type="primary"
              className="udt-btn"
              onClick={() => this.updatelModules(record)}
            />
          }
        </div>
      ),
    }];

    return (
       <div className="package-wrap">
        
        <div className="input-grp">
          <InputGroup compact>
            <Input style={{ width: '150px' }} value={installDp} size="small"
              onChange={e => this.setState({ installDp: e.target.value })}
            />
            <Button type="primary" size="small"
              onClick={() => this.newModule()}>{i18n('package.btn.install')}</Button>
          </InputGroup>
        </div>
        <Button type="primary" onClick={() => this.installModules()} size="small"
          disabled={!hasSelected}
          className="udt-all-btn"
        >{i18n('package.btn.updateAll')}</Button>
        <Table
          size="small"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          scroll={{ y: 286 }}
          rowKey={record => record.name}
          locale={{
            emptyText: i18n('table.empty'),
          }}
        />
      </div>
    );
  }

}

DependenceTable.propTypes = {
  source: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  registry: PropTypes.string.isRequired,
  filePath: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default DependenceTable;
