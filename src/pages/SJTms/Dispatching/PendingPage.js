/*
 * @Author: guankongjin
 * @Date: 2022-05-12 16:10:30
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-12 17:36:50
 * @Description: 待定订单
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\PendingPage.js
 */
import React, { Component } from 'react';
import { Table, Button, Typography, message } from 'antd';
import { OrderColumns } from './DispatchingColumns';
import { getOrderInPending } from '@/services/sjitms/OrderBill';
import { addOrders } from '@/services/sjitms/ScheduleBill';
import tableStyle from './CardTableStyle.less';

const { Title } = Typography;

export default class PendingPage extends Component {
  state = {
    loading: false,
    pendingData: [],
    pendingRowKeys: [],
  };

  componentDidMount() {
    this.refreshTable();
  }

  //刷新
  refreshTable = () => {
    this.getPendingOrders();
  };

  //获取待排运输订单
  getPendingOrders = () => {
    this.setState({ loading: true });
    getOrderInPending().then(response => {
      if (response.success) {
        this.setState({
          loading: false,
          pendingData: response.data,
          pendingRowKeys: [],
        });
      }
    });
  };

  //表格行点击事件
  onClickRow = record => {
    this.onSelectChange(record, this.state.pendingRowKeys.indexOf(record.uuid) == -1);
  };

  //删除待定
  handleRemovePending = () => {};

  //添加到排车单
  handleAddOrder = () => {
    const { pendingRowKeys } = this.state;
    const scheduleRowKeys = this.props.scheduleRowKeys();
    if (scheduleRowKeys.length == 0 || scheduleRowKeys == undefined) {
      message.warning('请选择排车单！');
      return;
    }
    if (pendingRowKeys.length == 0 || pendingRowKeys == undefined) {
      message.warning('请选择待定运输订单！');
      return;
    }
    addOrders({ billUuid: scheduleRowKeys[0], orderUuids: pendingRowKeys }).then(response => {
      if (response.success) {
        message.success('保存成功！');
        this.refreshTable();
        this.props.refresh();
      }
    });
  };

  onSelectChange = (record, selected) => {
    const { pendingRowKeys } = this.state;
    selected
      ? pendingRowKeys.push(record.uuid)
      : pendingRowKeys.splice(pendingRowKeys.findIndex(item => item == record.uuid), 1);
    this.setState({ pendingRowKeys });
  };
  onSelectAll = (selected, selectedRows, changeRows) => {
    const { pendingRowKeys } = this.state;
    let newSelectedRowKeys = [...pendingRowKeys];
    selected
      ? (newSelectedRowKeys = newSelectedRowKeys.concat(changeRows.map(item => item.uuid)))
      : (newSelectedRowKeys = []);
    this.setState({ pendingRowKeys: newSelectedRowKeys });
  };

  render() {
    const { loading, pendingData, pendingRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys: pendingRowKeys,
      onSelect: this.onSelectChange,
      onSelectAll: this.onSelectAll,
    };
    return (
      <div style={{ padding: 5 }}>
        <Title level={4}>待定列表</Title>
        <div style={{ margin: '5px 0' }}>
          <Button onClick={() => this.handleAddOrder()}>添加到排车单</Button>
          <Button style={{ marginLeft: 10 }} onClick={() => this.handleRemovePending()}>
            删除
          </Button>
        </div>
        <Table
          scrollY={50}
          size="small"
          pagination={{ defaultPageSize: 20 }}
          loading={loading}
          onRowClick={this.onClickRow}
          rowKey={record => record.uuid}
          rowSelection={rowSelection}
          dataSource={pendingData}
          columns={OrderColumns}
          scroll={{ y: scrollY, x: true }}
          className={tableStyle.orderTable}
        />
      </div>
    );
  }
}
