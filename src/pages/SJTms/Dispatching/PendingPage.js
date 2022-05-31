/*
 * @Author: guankongjin
 * @Date: 2022-05-12 16:10:30
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-30 14:25:44
 * @Description: 待定订单
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\PendingPage.js
 */
import React, { Component } from 'react';
import { Table, Button, Row, Col, Typography, message } from 'antd';
import { OrderColumns, pagination } from './DispatchingColumns';
import { getOrderInPending, removePending } from '@/services/sjitms/OrderBill';
import { addOrders } from '@/services/sjitms/ScheduleBill';
import RyzeSettingDrowDown from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeSettingDrowDown/RyzeSettingDrowDown';
import DispatchingTable from './DispatchingTable';
import dispatchingStyles from './Dispatching.less';

const { Title, Text } = Typography;

export default class PendingPage extends Component {
  state = {
    loading: false,
    pendingOrderColumns: [...OrderColumns],
    pendingData: [],
    pendingRowKeys: [],
  };

  componentDidMount() {
    this.pendingOrderColSetting.handleOK();
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
  handleRemovePending = () => {
    const { pendingRowKeys } = this.state;
    if (pendingRowKeys.length == 0) {
      message.warning('请选择运输订单！');
      return;
    }
    removePending(pendingRowKeys).then(response => {
      if (response.success) {
        message.success('保存成功！');
        this.refreshTable();
        this.props.refreshOrder();
      }
    });
  };

  //添加到排车单
  handleAddOrder = () => {
    const { pendingRowKeys } = this.state;
    const scheduleRowKeys = this.props.scheduleRowKeys();
    if (scheduleRowKeys.length != 1 || scheduleRowKeys == undefined) {
      message.warning('请选择一张排车单！');
      return;
    }
    if (pendingRowKeys.length == 0 || pendingRowKeys == undefined) {
      message.warning('请选择待定运输订单！');
      return;
    }
    addOrders({
      billUuid: scheduleRowKeys[0],
      orderUuids: pendingRowKeys,
    }).then(response => {
      if (response.success) {
        message.success('保存成功！');
        this.refreshTable();
        this.props.refreshSchedule();
      }
    });
  };

  tableChangeRows = selectedRowKeys => {
    const { pendingData } = this.state;
    this.props.refreshSelectRowOrder(
      pendingData.filter(x => selectedRowKeys.indexOf(x.uuid) != -1).map(item => {
        item.stat = 'Pending';
        return item;
      }),
      'Pending'
    );
    this.setState({ pendingRowKeys: selectedRowKeys });
  };
  //取消选中
  handleCancelRow = () => {
    this.tableChangeRows([]);
  };

  //更新列配置
  setColumns = (pendingOrderColumns, index, width) => {
    index ? this.pendingOrderColSetting.handleWidth(index, width) : {};
    this.setState({ pendingOrderColumns });
  };

  render() {
    const { loading, pendingOrderColumns, pendingData, pendingRowKeys } = this.state;
    return (
      <div style={{ padding: 5 }}>
        <Row style={{ marginBottom: 5, lineHeight: '28px' }}>
          <Col span={12}>
            <Text className={dispatchingStyles.cardTitle}>待定列表</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button onClick={() => this.handleAddOrder()}>添加到排车单</Button>
            <Button style={{ marginLeft: 10 }} onClick={() => this.handleRemovePending()}>
              移除待定
            </Button>
          </Col>
        </Row>
        <DispatchingTable
          clickRow
          pagination={pagination}
          setColumns={this.setColumns}
          children={
            <Row>
              <Col span={12}>
                <span style={{ fontSize: 14 }}>
                  已选：
                  {pendingRowKeys.length}
                </span>
                <Button style={{ marginLeft: 20 }} onClick={this.handleCancelRow}>
                  取消
                </Button>
              </Col>
              <Col span={12}>
                <RyzeSettingDrowDown
                  noToolbarPanel
                  columns={OrderColumns}
                  comId={'PendingOrderColumns'}
                  getNewColumns={this.setColumns}
                  onRef={ref => (this.pendingOrderColSetting = ref)}
                />
              </Col>
            </Row>
          }
          loading={loading}
          dataSource={pendingData}
          changeSelectRows={this.tableChangeRows}
          selectedRowKeys={pendingRowKeys}
          columns={pendingOrderColumns}
          scrollY="calc(68vh - 130px)"
        />
      </div>
    );
  }
}
