/*
 * @Author: guankongjin
 * @Date: 2022-05-12 16:10:30
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-14 16:07:20
 * @Description: 待定订单
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\PendingPage.js
 */
import React, { Component } from 'react';
import { Table, Button, Row, Col, Typography, message } from 'antd';
import { OrderColumns, pagination } from './DispatchingColumns';
import { getOrderInPending } from '@/services/sjitms/OrderBill';
import { addOrders } from '@/services/sjitms/ScheduleBill';
import DispatchingTable from './DispatchingTable';
import dispatchingStyles from './Dispatching.less';

const { Title, Text } = Typography;

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

  tableChangeRows = selectedRowKeys => {
    this.setState({ pendingRowKeys: selectedRowKeys });
  };

  render() {
    const { loading, pendingData, pendingRowKeys } = this.state;
    return (
      <div style={{ padding: 5 }}>
        <Row style={{ marginBottom: 5, lineHeight: '28px' }}>
          <Col span={12}>
            <Text className={dispatchingStyles.cardTitle}>待定列表</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button onClick={() => this.handleAddOrder()}>添加到排车单</Button>
            <Button style={{ marginLeft: 10 }} onClick={() => this.handleRemovePending()}>
              删除
            </Button>
          </Col>
        </Row>
        <DispatchingTable
          clickRow
          pagination={pagination}
          loading={loading}
          dataSource={pendingData}
          changeSelectRows={this.tableChangeRows}
          selectedRowKeys={pendingRowKeys}
          columns={OrderColumns}
          scrollY="calc(68vh - 120px)"
        />
      </div>
    );
  }
}
