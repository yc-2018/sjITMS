/*
 * @Author: guankongjin
 * @Date: 2022-05-12 16:10:30
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2024-05-10 16:20:57
 * @Description: 待定订单
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\PendingPage.js
 */
import React, { Component } from 'react';
import { Button, Row, Col, Typography, message, Icon, Modal } from 'antd';
import {
  OrderColumns,
  OrderCollectColumns,
  OrderDetailColumns,
  pagination,
} from './DispatchingColumns';
import { getOrderInPending, removePending } from '@/services/sjitms/OrderBill';
import { addOrders, checkAreaSchedule } from '@/services/sjitms/ScheduleBill';
import DispatchingTable from './DispatchingTable';
import DispatchingChildTable from './DispatchingChildTable';
import dispatchingStyles from './Dispatching.less';
import { groupBy, sumBy } from 'lodash';

const { Text } = Typography;

export default class PendingPage extends Component {
  state = {
    loading: false,
    btnLoading: false,
    pendingData: [],
    pendingCollectData: [],
    pendingParentRowKeys: [],
    pendingRowKeys: [],
  };

  componentDidMount() {
    this.refreshTable();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.isOrderCollect != this.props.isOrderCollect) {
      this.setState({ pendingParentRowKeys: [], pendingRowKeys: [] });
    }
  }

  //刷新
  refreshTable = () => {
    this.getPendingOrders();
    this.props.refreshSelectRowOrder([], ['Pending']);
  };

  //获取待排运输订单
  getPendingOrders = () => {
    this.setState({ loading: true });
    getOrderInPending().then(response => {
      if (response.success) {
        let data = response.data || [];
        data = data?.map(order => {
          const cartonCount = order.realCartonCount || order.cartonCount;
          order.warning = order.stillCartonCount < cartonCount;
          return order;
        });
        this.setState({
          loading: false,
          pendingData: response.data,
          pendingCollectData: this.groupData(response.data),
          pendingRowKeys: [],
          pendingParentRowKeys: [],
        });
      }
    });
  };

  //按送货点汇总运输订单
  groupData = data => {
    const { isOrderCollectType } = this.props;
    let output;
    //按波次号+门店号合并
    if (isOrderCollectType && isOrderCollectType == 2) {
      output = groupBy(data, x => [x.deliveryPoint.code, x.waveNum]);
    } else {
      output = groupBy(data, x => x.deliveryPoint.code);
    }
    let deliveryPointGroupArr = Object.keys(output).map(pointCode => {
      const orders = output[pointCode];
      return {
        pointCode,
        waveNum: [...new Set(orders.map(e => e.waveNum))].join(','),
        uuid: orders[0].uuid,
        deliveryPoint: orders[0].deliveryPoint,
        archLine: orders[0].archLine,
        owner: orders[0].owner,
        address: orders[0].deliveryPoint.address,
        stillCartonCount: Math.round(sumBy(orders, 'stillCartonCount') * 1000) / 1000,
        stillScatteredCount: Math.round(sumBy(orders, 'stillScatteredCount') * 1000) / 1000,
        stillContainerCount: Math.round(sumBy(orders, 'stillContainerCount') * 1000) / 1000,
        cartonCount: Math.round(sumBy(orders, 'cartonCount') * 1000) / 1000,
        realCartonCount: Math.round(sumBy(orders, 'realCartonCount') * 1000) / 1000,
        scatteredCount: Math.round(sumBy(orders, 'scatteredCount') * 1000) / 1000,
        realScatteredCount: Math.round(sumBy(orders, 'realScatteredCount') * 1000) / 1000,
        containerCount: Math.round(sumBy(orders, 'containerCount') * 1000) / 1000,
        realContainerCount: Math.round(sumBy(orders, 'realContainerCount') * 1000) / 1000,

        freezeContainerCount: Math.round(sumBy(orders, 'freezeContainerCount') * 1000) / 1000,
        coldContainerCount: Math.round(sumBy(orders, 'coldContainerCount') * 1000) / 1000,
        freshContainerCount: Math.round(sumBy(orders, 'freshContainerCount') * 1000) / 1000,
        insulatedBag: Math.round(sumBy(orders, 'insulatedbagcount') * 1000) / 1000,
        insulatedContainerCount: Math.round(sumBy(orders, 'insulatedContainerCount') * 1000) / 1000,

        volume: Math.round(sumBy(orders, 'volume') * 1000) / 1000,
        weight: Math.round(sumBy(orders, 'weight') * 1000) / 1000,
      };
    });
    deliveryPointGroupArr.forEach(data => {
      data.details = output[data.pointCode];
    });
    return deliveryPointGroupArr;
  };

  //删除待定
  handleRemovePending = async () => {
    const { pendingRowKeys } = this.state;
    if (pendingRowKeys.length == 0) {
      message.warning('请选择运输订单！');
      return;
    }
    this.setState({ btnLoading: true });
    const response = await removePending(pendingRowKeys);
    if (response.success) {
      message.success('保存成功！');
      this.refreshTable();
      this.props.refreshOrder();
    }
    this.setState({ btnLoading: false });
  };

  //添加到排车单
  handleAddOrder = async () => {
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
    this.setState({ btnLoading: true });
    const checkResponse = await checkAreaSchedule(pendingRowKeys, scheduleRowKeys[0]);
    if (checkResponse && checkResponse.data) {
      Modal.confirm({
        title: '所选门店配送区域不一样，确定排车吗？',
        onOk: async () => {
          this.doAddOrders(scheduleRowKeys[0], pendingRowKeys);
        },
        onCancel: () => {
          this.setState({ btnLoading: false });
        },
      });
      return;
    }
    this.doAddOrders(scheduleRowKeys[0], pendingRowKeys);
  };
  doAddOrders = async (billUuid, orderUuids) => {
    const response = await addOrders({
      billUuid: billUuid,
      orderUuids: orderUuids,
    });
    if (response.success) {
      message.success('保存成功！');
      this.refreshTable();
      this.props.refreshSchedule();
    }
    this.setState({ btnLoading: false });
  };
  //表格行选择
  tableChangeRows = selectedRowKeys => {
    const { pendingData } = this.state;
    this.props.refreshSelectRowOrder(
      pendingData.filter(x => selectedRowKeys.indexOf(x.uuid) != -1).map(item => {
        item.stat = 'Pending';
        return item;
      }),
      ['Pending']
    );
    this.setState({ pendingRowKeys: selectedRowKeys });
  };
  childTableChangeRows = result => {
    const { pendingData } = this.state;
    this.props.refreshSelectRowOrder(
      pendingData.filter(x => result.childSelectedRowKeys.indexOf(x.uuid) != -1).map(item => {
        item.stat = 'Pending';
        return item;
      }),
      ['Pending']
    );
    this.setState({
      pendingParentRowKeys: result.selectedRowKeys,
      pendingRowKeys: result.childSelectedRowKeys,
    });
  };
  //取消选中
  handleCancelRow = () => {
    this.setState({ pendingParentRowKeys: [] });
    this.tableChangeRows([]);
  };

  render() {
    const {
      loading,
      btnLoading,
      pendingData,
      pendingCollectData,
      pendingParentRowKeys,
      pendingRowKeys,
    } = this.state;
    const settingColumnsBar = (
      // <>
      //   <span style={{ fontSize: 14 }}>
      //     已选：
      //     {pendingRowKeys.length}
      //   </span>
      //   <Button
      //     style={{ marginLeft: 20, marginBottom: 5 }}
      //     size="small"
      //     onClick={this.handleCancelRow}
      //   >
      //     取消
      //   </Button>
      // </>
      <div className={dispatchingStyles.orderTotalPane}>
        <Icon type="info-circle" theme="filled" style={{ color: '#3B77E3' }} />
        <span style={{ marginLeft: 5 }}>
          已选择
          <span style={{ color: '#3B77E3', margin: '0 2px' }}>{pendingRowKeys.length}</span>项
        </span>
        <a href="##" style={{ marginLeft: 10 }} onClick={() => this.handleCancelRow()}>
          取消全部
        </a>
      </div>
    );
    return (
      <div style={{ padding: 5 }}>
        <Row style={{ marginBottom: 5, lineHeight: '28px' }}>
          <Col span={6}>
            <Text className={dispatchingStyles.cardTitle}>待定列表</Text>
          </Col>
          <Col span={18} style={{ textAlign: 'right' }}>
            <Button
              onClick={() => this.refreshTable()}
              icon={loading ? 'loading' : 'sync'}
              style={{ marginRight: 10 }}
            >
              刷新
            </Button>
            <Button onClick={() => this.handleAddOrder()} loading={btnLoading}>
              添加到排车单
            </Button>
            <Button
              style={{ marginLeft: 10 }}
              onClick={() => this.handleRemovePending()}
              loading={btnLoading}
            >
              移除待定
            </Button>
          </Col>
        </Row>
        {this.props.isOrderCollect ? (
          <DispatchingChildTable
            comId="collectPendingOrder"
            clickRow
            settingColumnsBar={settingColumnsBar}
            // childSettingCol
            noToolbarPanel={true}
            pagination={pagination || false}
            loading={loading}
            dataSource={pendingCollectData}
            refreshDataSource={pendingCollectData => {
              this.childTableChangeRows({ selectedRowKeys: [], childSelectedRowKeys: [] });
              this.setState({ pendingCollectData });
            }}
            changeSelectRows={this.childTableChangeRows}
            selectedRowKeys={pendingParentRowKeys}
            childSelectedRowKeys={pendingRowKeys}
            columns={OrderCollectColumns}
            nestColumns={OrderDetailColumns}
            scrollY="calc(60vh - 135px)"
            title={this.buildTitle}
          />
        ) : (
          <DispatchingTable
            comId="pendingOrder"
            clickRow
            pagination={pagination}
            settingColumnsBar={settingColumnsBar}
            loading={loading}
            noToolbarPanel={true}
            dataSource={pendingData}
            refreshDataSource={pendingData => {
              this.tableChangeRows([]);
              this.setState({ pendingData });
            }}
            changeSelectRows={this.tableChangeRows}
            selectedRowKeys={pendingRowKeys}
            columns={OrderColumns}
            scrollY="calc(60vh - 135px)"
          />
        )}
      </div>
    );
  }
}
