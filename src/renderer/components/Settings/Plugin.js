/*
  工具设置－插件列表
*/
import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Table from 'antd/lib/table';
import Popconfirm from 'antd/lib/popconfirm';

import i18n from 'i18n-renderer-nowa';


const PluginTable = ({
  dispatch,
  loading,
  pluginList,
  tableHeight,
  online,
}) => {
  const installPlugin = payload =>
    dispatch({ type: 'plugin/install', payload });
  const updatePlugin = payload => dispatch({ type: 'plugin/update', payload });
  const uninstallPlugin = payload => dispatch({ type: 'plugin/uninstall', payload });
  // const applyPlugin = (checked, record) =>
  //   dispatch({
  //     type: 'plugin/apply',
  //     payload: { checked, record },
  //   });
  const goBack = () => dispatch({ type: 'layout/goBack' });

  const basicColumns = [
      title: i18n('setting.plugin.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: i18n('setting.plugin.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type) => i18n(`setting.plugin.${type}`)
    },
    {
      title: i18n('setting.plugin.version'),
      dataIndex: 'version',
      key: 'version',
    },
  ];

  // 联网时插件表格项
  const getOnlineColumns = () => {
    const widths = ['30%', '15%', '20%', '20%', '15%'];
    const columns = [
      ...basicColumns,
      {
        title: i18n('setting.plugin.newest'),
        dataIndex: 'newest',
        key: 'newest',
      },
      {
        title: i18n('setting.plugin.action'),
        key: 'action',
        dataIndex: 'installed',
        render: (installed, record) => {
          if (!installed) {
            return (
              <Button
                size="small"
                type="primary"
                ghost
                className="setting-plugin-action"
                onClick={() => installPlugin(record)}
              >
                {i18n('setting.plugin.download')}
              </Button>
            );
          } else if (record.needUpdate) {
            return (
              <Popconfirm
                placement="bottomRight"
                title={i18n('setting.plugin.update.tip')}
                onConfirm={() => updatePlugin(record)}
                okText={i18n('form.ok')}
                cancelText={i18n('form.cancel')}
              >
                <Button
                  size="small"
                  type="danger"
                  className="setting-plugin-action"
                >
                  {i18n('setting.plugin.update')}
                </Button>
              </Popconfirm>
            );
          }
          return (
            <Popconfirm
              placement="bottomRight"
              title={i18n('setting.plugin.uninstall.tip')}
              onConfirm={() => uninstallPlugin(record)}
              okText={i18n('form.ok')}
              cancelText={i18n('form.cancel')}
            >
              <Button
                className="setting-plugin-action"
                size="small"
                type="danger"
                ghost
              >{i18n('setting.plugin.uninstall')}
              </Button>
            </Popconfirm>
          );
        }
      },
    ];

    return columns.map((col, i) => {
      col.width = widths[i];
      return col;
    });
  };

  // 断网时插件表格项
  const getOfflineColumns = () => {
    // const widths = ['50%', '25%', '25%'];
    const widths = ['40%', '20%', '20%', '20%'];

    const columns = [
      ...basicColumns,
      {
        title: i18n('package.action'),
        key: 'action',
        dataIndex: 'installed',
        render: () =>
          <Button disabled className="setting-plugin-action" size="default">
            {i18n('setting.plugin.update')}
          </Button>,
      },
    ];

    return columns.map((col, i) => {
      col.width = widths[i];
      return col;
    });
  };

  return (
    <div className="setting-plugin">
      <Table
        className="setting-plugin-table"
        size="small"
        columns={online ? getOnlineColumns() : getOfflineColumns()}
        dataSource={pluginList}
        loading={loading}
        pagination={false}
        rowKey={record => record.name}
        scroll={{ y: tableHeight }}
        locale={{
          emptyText: i18n('table.empty'),
        }}
      />
      <Button type="default" size="default" onClick={goBack}>
        {i18n('form.back')}
      </Button>
    </div>
  );
};

PluginTable.propTypes = {
  pluginList: PropTypes.array.isRequired,
  online: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  tableHeight: PropTypes.string.isRequired,
};

export default connect(({ layout, plugin }) => ({
  pluginList: plugin.pluginList,
  // registry: setting.registry,
  loading: plugin.loading,
  online: layout.online,
  tableHeight: `${layout.windowHeight - 270}px`,
}))(PluginTable);
