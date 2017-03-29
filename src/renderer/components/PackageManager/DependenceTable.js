import React, { Component, PropTypes } from 'react';
import { remote, ipcRenderer } from 'electron';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Table from 'antd/lib/table';
// import Input from 'antd/lib/input';
import Popconfirm from 'antd/lib/popconfirm';
import semver from 'semver';
import { join } from 'path';

import i18n from 'i18n';
import request from 'gui-request';
const { utils } = remote.getGlobal('services');

const basicColumns = [{
  title: 'Name',
  dataIndex: 'name',
  key: 'name',
  width: 220,
}, {
  title: 'Current',
  dataIndex: 'version',
  key: 'version',
  width: 90,
}, {
  title: 'Installed',
  dataIndex: 'installedVersion',
  key: 'installedVersion',
  width: 90,
}, {
  title: 'Newest',
  dataIndex: 'netVersion',
  key: 'netVersion',
  width: 90,
}];


class DependenceTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selectedRowKeys: []
    };
  }

  async componentDidMount() {
    this.getVersions(this.props).then((dataSource) => {
      this.setState({ dataSource, loading: false });
    });
    ipcRenderer.on('install-modules-finished', this.onReceiveFinished.bind(this));
    // pubsub.subscribe('install-modules-finished', this.onReceiveFinished);
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
    // pubsub.unsubscribe('install-modules-finished');
    ipcRenderer.removeAllListeners('install-modules-finished');
  }

  async getVersions({ filePath, source, registry }) {
    const localPkgs = utils.getMoudlesVersion(filePath, source);
    const netPkgs = await this.fetchMoudlesVersion(localPkgs, registry);
    return netPkgs;
  }

  onReceiveFinished(e, { pkgs, err }) {
    console.log(pkgs, err);
    if (!err) {
      const { dataSource } = this.state;
      const data = dataSource.map((item) => {
        const filter = pkgs.filter(p => p.name === item.name);
        if (filter.length > 0) {
          item.version = `^${item.netVersion}`;
          item.installedVersion = item.netVersion;
          item.update = false;
        }
        return item;
      });
      Message.success(i18n('msg.updateSuccess'));
      this.setState({ loading: false, dataSource: data, selectedRowKeys: [] });
    } else {
      Message.error(i18n('msg.updateFailed'));
      this.setState({ loading: false, selectedRowKeys: [] });
    }
  }

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

  installModules() {
    const { filePath, registry, dispatch, type } = this.props;
    
    const args = [].slice.call(arguments);
    let pkgs = [];
    const opt = {
      root: filePath,
      registry,
      targetDir: filePath,
      storeDir: join(filePath, '.npminstall'),
      cacheDir: null,
      timeout: 5 * 60000,
    };

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
    const option = { ...opt, pkgs };
    this.setState({ loading: true });
    dispatch({
      type: 'project/updateModules',
      payload: {
        option,
        type,
      }
    });
  }

  removeModules(pkg) {
    const { type, dispatch } = this.props;
    const { dataSource } = this.state;

    const filter = dataSource.filter(item => item.name !== pkg.name);
    dispatch({
      type: 'project/uninstallModules',
      payload: { pkgName: pkg.name, type }
    });
    this.setState({ dataSource: filter });
  }

  render() {
    const { loading, selectedRowKeys, dataSource } = this.state;
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
      title: 'Action',
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
              onClick={() => this.installModules(record)}
            />
          }
        </div>
        /*return update
          ? <Button
            icon="download"
            size="small"
            type="primary"
            ghost
            className="udt-btn"
            onClick={() => this.installModules(record)}
            />
          : <span />;*/
      ),
    }];

    return (
       <div className="package-wrap">
        <div style={{ marginBottom: 8 }}>
          <Button type="primary" onClick={() => this.installModules()} size="small"
            disabled={!hasSelected}
          >Update All</Button>
        </div>
        <Table
          size="small"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          scroll={{ y: 270 }}
          rowKey={record => record.name}
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
