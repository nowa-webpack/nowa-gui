import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Table from 'antd/lib/table';
import Popconfirm from 'antd/lib/popconfirm';
import Input from 'antd/lib/input';
import Switch from 'antd/lib/switch';
import { join } from 'path';

import i18n from 'i18n-renderer-nowa';
// import { getApplyedPlugins } from 'store-renderer-nowa';

const PluginTable = ({
  dispatch,
  loading,
  pluginList,
  tableHeight,
  online,
}) => {
  const installPlugin = payload =>
    dispatch({ type: 'plugin/install', payload });
  const updateplugin = payload => dispatch({ type: 'plugin/update', payload });
  const applyPlugin = (checked, record) =>
    dispatch({
      type: 'plugin/apply',
      payload: { checked, record },
    });
  const goBack = () => dispatch({ type: 'layout/goBack' });

  const basicColumns = [
    {
      //   title: i18n('setting.plugin.apply'),
      //   dataIndex: 'apply',
      //   key: 'apply',
      //   render: (apply, record) =>
      //     (<Switch
      //       checked={apply}
      //       size="small"
      //       disabled={!record.installed && record.type === 'cli'}
      //       onChange={checked => applyPlugin(checked, record)}
      //     />)
      // }, {
      title: i18n('setting.plugin.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: i18n('setting.plugin.version'),
      dataIndex: 'version',
      key: 'version',
    },
  ];

  const getOnlineColumns = () => {
    // const widths = ['10%', '30%', '20%', '20%', '10%'];
    const widths = ['40%', '20%', '20%', '20%'];
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
                onConfirm={() => updateplugin(record)}
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
          } else {
            return (
              <Button disabled className="setting-plugin-action" size="small">
                {i18n('setting.plugin.update')}
              </Button>
            );
          }
        },
      },
    ];

    return columns.map((col, i) => {
      col.width = widths[i];
      return col;
    });
  };

  const getOfflineColumns = () => {
    const widths = ['50%', '25%', '25%'];

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
  registry: PropTypes.string.isRequired,
  online: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  tableHeight: PropTypes.string.isRequired,
};

export default connect(({ setting, layout, plugin }) => ({
  pluginList: plugin.pluginList,
  registry: setting.registry,
  // atAli: plugin.atAli,
  loading: plugin.loading,
  online: layout.online,
  tableHeight: `${layout.windowHeight - 270}px`,
}))(PluginTable);
