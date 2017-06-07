import React, { PropTypes } from 'react';
import Button from 'antd/lib/button';
import Table from 'antd/lib/table';
import Popconfirm from 'antd/lib/popconfirm';
import Switch from 'antd/lib/switch';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import { connect } from 'dva';

import i18n from 'i18n-renderer-nowa';

const CommandTable = ({ height, globalCommandSet, dispatch }) => {
  const tableHeight = `${height - 380}px`;

  const deleteCmd = cmd =>
    dispatch({
      type: 'task/deleteGlobalCommand',
      payload: { cmd },
    });

  const applyCmd = (apply, cmd) =>
    dispatch({
      type: `task/${apply ? 'apply' : 'unapply'}GlobalCommand`,
      payload: { cmd },
    });

  const columns = [
    {
      title: i18n('cmd.meta.apply'),
      key: 'apply',
      dataIndex: 'apply',
      width: '80px',
      render: (apply, record) => {
        return (
          <Switch
            checked={apply}
            size="small"
            onChange={checked => applyCmd(checked, record.name)}
          />
        );
      },
    },
    {
      title: i18n('cmd.meta.name'),
      dataIndex: 'name',
      key: 'name',
      width: '120px',
    },
    {
      title: i18n('cmd.meta.value'),
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: i18n('cmd.meta.action'),
      key: 'action',
      width: '50px',
      render: (update, record) => {
        return (
          <Popconfirm
            placement="right"
            title={i18n('msg.removeTip')}
            onConfirm={() => deleteCmd(record.name)}
            okText={i18n('form.ok')}
            cancelText={i18n('form.cancel')}
          >
            <Button size="small" type="danger" ghost className="commands-del">
              {i18n('table.action.del')}
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Row>
      <Col span={23}>
        <Table
          className="setting-commands-table"
          size="small"
          columns={columns}
          dataSource={globalCommandSet}
          pagination={false}
          rowKey={record => record.name}
          scroll={{ y: tableHeight }}
          locale={{
            emptyText: i18n('table.empty'),
          }}
        />
      </Col>
    </Row>
  );
};

CommandTable.propTypes = {
  globalCommandSet: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
};

export default connect(({ task, layout }) => ({
  globalCommandSet: task.globalCommandSet || [],
  height: layout.windowHeight,
}))(CommandTable);
