/*
  依赖表格
*/
import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import Button from 'antd/lib/button';
import Table from 'antd/lib/table';
import Popconfirm from 'antd/lib/popconfirm';
import Input from 'antd/lib/input';
import { join } from 'path';

import i18n from 'i18n-renderer-nowa';
import {
  openUrl,
  checkInstalledVersion,
  checkLatestVersion,
  readPkgJson,
  msgError,
  msgSuccess,
} from 'util-renderer-nowa';
import DependencyModal from './Modal';

const { commands } = remote.getGlobal('services');
const Search = Input.Search;

const basicColumns = [
  {
    title: i18n('package.name'),
    dataIndex: 'name',
    key: 'name',
    render: text =>
      <a onClick={() => openUrl(`https://www.npmjs.com/package/${text}`)}>
        {text}
      </a>,
  },
  {
    title: i18n('package.current'),
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: i18n('package.installed'),
    dataIndex: 'installedVersion',
    key: 'installedVersion',
  },
];

class DependencyTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selectedRowKeys: [],
      showModal: false,
      filterName: '',
      dataSource: [],
    };

    this.columns = [];

    this.onHideModal = this.onHideModal.bind(this);
    this.getOnlineColumns = this.getOnlineColumns.bind(this);
    this.uninstallPackage = this.uninstallPackage.bind(this);
    this.installPackage = this.installPackage.bind(this);
  }

  componentDidMount() {
    this.initStatus(this.props);
  }

  componentWillReceiveProps(next) {
    this.initStatus(next);
  }

  onHideModal() {
    this.setState({ showModal: false });
  }

  // 联网时显示的表格字段
  getOnlineColumns() {
    const widths = ['34%', '15%', '15%', '15%', '21%'];
    const columns = [
      ...basicColumns,
      {
        title: i18n('package.newest'),
        dataIndex: 'latestVersion',
        key: 'latestVersion',
      },
      {
        title: i18n('package.action'),
        key: 'action',
        dataIndex: 'needUpdate',
        render: (needUpdate, record) => {
          let updateDiv;

          if (needUpdate) {
            if (record.updateType !== 'major') {
              updateDiv = (
                <Button
                  size="default"
                  type="primary"
                  className="project-dependency-action"
                  onClick={() => this.updatePackage(record)}
                >
                  {i18n('table.action.update')}
                </Button>
              );
            } else {
              updateDiv = (
                <Popconfirm
                  placement="bottomRight"
                  title={i18n('package.update.tip')}
                  onConfirm={() => this.updatePackage(record)}
                  okText={i18n('form.ok')}
                  cancelText={i18n('form.cancel')}
                >
                  <Button
                    size="default"
                    type="danger"
                    className="project-dependency-action"
                  >
                    {i18n('table.action.update')}
                  </Button>
                </Popconfirm>
              );
            }
          } else {
            updateDiv = (
              <Button
                disabled
                className="project-dependency-action"
                size="default"
              >
                {i18n('table.action.update')}
              </Button>
            );
          }

          return (
            <div>
              {updateDiv}
              <Popconfirm
                placement="bottomRight"
                title={i18n('msg.removeTip')}
                onConfirm={() => this.uninstallPackage(record)}
                okText={i18n('form.ok')}
                cancelText={i18n('form.cancel')}
              >
                <Button
                  size="default"
                  type="danger"
                  ghost
                  className="project-dependency-action del"
                >
                  {i18n('table.action.del')}
                </Button>
              </Popconfirm>
            </div>
          );
        },
      },
    ];

    return columns.map((col, i) => {
      col.width = widths[i];
      return col;
    });
  }

  // 断网时显示的表格字段
  getOfflineColumns() {
    const widths = ['40%', '20%', '20%', '20%'];

    const columns = [
      ...basicColumns,
      {
        title: i18n('package.action'),
        key: 'action',
        dataIndex: 'update',
        render: (update, record) =>
          <Popconfirm
            placement="bottomRight"
            title={i18n('msg.removeTip')}
            onConfirm={() => this.uninstallPackage(record)}
            okText={i18n('form.ok')}
            cancelText={i18n('form.cancel')}
          >
            <Button
              size="default"
              type="danger"
              ghost
              className="project-dependency-action del"
            >
              {i18n('table.action.del')}
            </Button>
          </Popconfirm>,
      },
    ];

    return columns.map((col, i) => {
      col.width = widths[i];
      return col;
    });
  }

  // 卸载依赖
  uninstallPackage({ name, installedVersion }) {
    const { type, dispatch } = this.props;
    const { dataSource } = this.state;

    const filter = dataSource.filter(item => item.name !== name);
    dispatch({
      type: 'project/uninstallPackage',
      payload: { data: { name, version: installedVersion }, type },
    });
    this.setState({ dataSource: filter });
  }

  // 更新依赖
  async updatePackage() {
    const { type, dispatch, projPath, registry } = this.props;
    const { selectedRowKeys, dataSource } = this.state;
    const args = [...arguments];
    let pkgs = [];

    if (args.length) {
      pkgs = args.map(({ name }) => ({ name, version: 'latest' }));
    } else {
      pkgs = selectedRowKeys.map(name => ({ name, version: 'latest' }));
    }
    console.log(pkgs);
    const opt = { root: projPath, pkgs, registry, type };
    this.setState({ loading: true });
    // const { err } = await commands.install({ opt });
    const { err } = await commands.noLoggingInstall(opt);
    if (!err) {
      const data = dataSource.map(item => {
        const filter = pkgs.filter(p => p.name === item.name);
        if (filter.length > 0) {
          // if (item.updateType === 'major') {
            item.version = `^${item.latestVersion}`;
          // }
          item.installedVersion = item.latestVersion;
          item.needUpdate = false;
        }
        return item;
      });
      dispatch({
        type: 'project/updateDepencies',
        payload: { data, type },
      });
      msgSuccess(i18n('msg.updateSuccess'));
      this.setState({ loading: false, dataSource: data, selectedRowKeys: [] });
    } else {
      msgError(err);
      this.setState({ loading: false });
    }
  }

  // 初始化状态
  async initStatus({ online, source, projPath, registry }) {
    if (online) {
      this.setState({ loading: true });
      this.columns = this.getOnlineColumns();
      const dataSource = await checkLatestVersion(source, projPath, registry);
      this.setState({ dataSource, loading: false });
    } else {
      this.columns = this.getOfflineColumns();
      const dataSource = checkInstalledVersion(source, projPath);
      this.setState({ dataSource, loading: false });
    }
  }

  // 安装依赖
  async installPackage({ name }) {
    const { projPath, type, dispatch, registry } = this.props;
    const set = new Set(name.split(',').filter(n => n.trim()));
    // const pkgs = [...set].map(item => ({ name: item.trim(), version: 'latest' }));
    const pkgs = [...set].map(item => {
      const str = item.trim().split('@');
      return { name: str[0], version: str[1] ? str[1] : 'latest' };
    });
    this.setState({ loading: true, showModal: false });

    const opt = {
      root: projPath,
      pkgs,
      registry,
      type
    };

    console.log(opt);
    // const { err } = await commands.install({ opt });
    const { err } = await commands.noLoggingInstall(opt);

    if (err) {
      msgError(i18n('msg.installFail'));
      this.setState({ loading: false });
    } else {
      const data = pkgs.map(pkg => {
        const { version } = readPkgJson(
          join(projPath, 'node_modules', pkg.name)
        );
        return {
          name: pkg.name,
          version: `^${version}`,
          installedVersion: version,
          latestVersion: version,
          needUpdate: false,
        };
      });
      const newDataSource = this.state.dataSource.concat(data);

      dispatch({
        type: 'project/updateDepencies',
        payload: { type, data },
      });
      msgSuccess(i18n('msg.installSuccess'));
      this.setState({ dataSource: newDataSource, loading: false });
    }
  }

  render() {
    const {
      loading,
      selectedRowKeys,
      dataSource,
      showModal,
      filterName,
    } = this.state;
    const { online, tableHeight } = this.props;
    const hasSelected = selectedRowKeys.length > 0;

    const filterDataSource = dataSource.filter(
      item => item.name.indexOf(filterName) === 0
    );

    const extraProps = {};

    if (online) {
      extraProps.rowSelection = {
        selectedRowKeys,
        onChange: selectedRows =>
          this.setState({ selectedRowKeys: selectedRows }),
        onSelectAll: (selected, selectedRows, changeRows) => {
          if (changeRows.length === 0) {
            this.setState({ selectedRowKeys: [] });
          }
        },
        getCheckboxProps: record => ({
          disabled: !record.needUpdate,
        }),
      };
    }

    const ModalGen = () =>
      <DependencyModal
        showModal={showModal}
        onHandleOK={this.installPackage}
        onHideModal={this.onHideModal}
      />;

    return (
      <div className="project-dependency">
        {online &&
          <Button
            onClick={() => this.updatePackage()}
            type="primary"
            size="small"
            disabled={!hasSelected}
            className="project-dependency-update-all"
          >
            {i18n('package.btn.updateAll')}
          </Button>}
        <Button
          type="primary"
          ghost
          size="small"
          className="project-dependency-new"
          onClick={() => this.setState({ showModal: true })}
        >
          {i18n('package.btn.install')}
        </Button>
        <div className="project-dependency-search">
          <Search
            placeholder="Package names"
            style={{ width: 200 }}
            onSearch={value => this.setState({ filterName: value })}
            onChange={e => this.setState({ filterName: e.target.value })}
            size="small"
          />
        </div>
        <Table
          className="project-dependency-table"
          size="small"
          columns={this.columns}
          dataSource={filterDataSource}
          loading={loading}
          pagination={false}
          rowKey={record => record.name}
          scroll={{ y: tableHeight }}
          locale={{
            emptyText: i18n('table.empty'),
          }}
          {...extraProps}
        />
        <ModalGen />
      </div>
    );
  }
}

DependencyTable.propTypes = {
  source: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  registry: PropTypes.string.isRequired,
  projPath: PropTypes.string.isRequired,
  online: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  tableHeight: PropTypes.string.isRequired,
};

export default DependencyTable;
