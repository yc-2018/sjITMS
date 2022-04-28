/*
 * @Author: guankongjin
 * @Date: 2022-03-30 16:34:02
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-28 16:01:40
 * @Description: 订单池面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\OrderPoolPage.js
 */
import React, { Component } from 'react';
import { Table, Button, Tabs, message } from 'antd';
import CardTable from './CardTable';
import { OrderColumns, OrderDetailColumns } from './DispatchingColumns';
import OrderPoolSearchForm from './OrderPoolSearchForm';
import DispatchingCreatePage from './DispatchingCreatePage';
import {
  getAuditedOrder,
  getOrderByStat,
  getOrderInPending,
  savePending,
} from '@/services/sjitms/OrderBill';
import { groupBy, sumBy } from 'lodash';

const { TabPane } = Tabs;
const initRowKeys = {
  auditedRowKeys: [],
  scheduledRowKeys: [],
  pendingRowKeys: [],
};
export default class OrderPoolPage extends Component {
  state = {
    searchKeyValues: {},
    loading: false,
    auditedData: [],
    scheduledData: [],
    pendingData: [],
    ...initRowKeys,
    activeTab: 'Audited',
  };

  componentDidMount() {
    this.refreshTable();
  }

  //刷新
  refreshTable = searchKeyValues => {
    if (searchKeyValues == undefined) {
      searchKeyValues = { orderType: 'Delivery' };
    }
    this.getAuditedOrders(searchKeyValues);
  };

  //获取待排运输订单
  getAuditedOrders = searchKeyValues => {
    this.setState({ loading: true });
    getAuditedOrder(searchKeyValues).then(response => {
      if (response.success) {
        this.setState({
          searchKeyValues,
          loading: false,
          auditedData: response.data,
          ...initRowKeys,
          activeTab: 'Audited',
        });
      }
    });
  };
  //获取已排运输订单
  getScheduledOrders = () => {
    this.setState({ loading: true });
    getOrderByStat('Scheduled').then(response => {
      if (response.success) {
        this.setState({
          loading: false,
          scheduledData: response.data,
          ...initRowKeys,
        });
      }
    });
  };
  //获取待排运输订单
  getPendingOrders = () => {
    this.setState({ loading: true });
    getOrderInPending().then(response => {
      if (response.success) {
        this.setState({
          loading: false,
          pendingData: response.data,
          ...initRowKeys,
        });
      }
    });
  };
  //按送货点汇总运输订单
  groupData = data => {
    let output = groupBy(data, 'deliverypointcode');
    let deliveryPointGroupArr = Object.keys(output).map(pointCode => {
      const orders = output[pointCode];
      return {
        pointCode,
        orderStat: orders[0].stat,
        archLineCode: '',
        deliverypoint: `[${orders[0].deliveryPoint.code}]` + orders[0].deliveryPoint.name,
        address: orders[0].deliveryPoint.address,
        cartonCount: sumBy(orders, 'cartonCount') + '/' + sumBy(orders, 'realCartonCount'),
        scatteredCount: sumBy(orders, 'scatteredCount') + '/' + sumBy(orders, 'realScatteredCount'),
        containerCount: sumBy(orders, 'containerCount') + '/' + sumBy(orders, 'realContainerCount'),
        volume: sumBy(orders, 'volume'),
        weight: sumBy(orders, 'weight'),
        owner: orders[0].owner,
      };
    });
    deliveryPointGroupArr.forEach(data => {
      data.details = output[data.pointCode];
    });
    return deliveryPointGroupArr;
  };

  //标签页切换事件
  handleTabChange = activeKey => {
    this.setState({ activeTab: activeKey });
    switch (activeKey) {
      case 'Pending':
        this.getPendingOrders(activeKey);
        break;
      case 'Scheduled':
        this.getScheduledOrders(activeKey);
        break;
      default:
        break;
    }
  };

  //表格行选择
  tableChangeRows = tableType => {
    return event => {
      switch (tableType) {
        case 'Pending':
          this.setState({ pendingRowKeys: event.selectedRowKeys });
          break;
        case 'Scheduled':
          this.setState({ scheduledRowKeys: event.selectedRowKeys });
          break;
        default:
          this.setState({ auditedRowKeys: event.selectedRowKeys });
          break;
      }
    };
  };

  //排车
  dispatching = () => {
    const { auditedRowKeys, auditedData } = this.state;
    if (auditedRowKeys.length == 0) {
      message.warning('请选择运输订单！');
      return;
    }
    const orders = auditedData ? auditedData.filter(x => auditedRowKeys.indexOf(x.uuid) != -1) : [];
    this.createPageModalRef.show(false, orders);
  };

  //添加到待定池
  handleAddPending = () => {
    const { auditedRowKeys } = this.state;
    if (auditedRowKeys.length == 0) {
      message.warning('请选择运输订单！');
      return;
    }
    savePending(auditedRowKeys).then(response => {
      if (response.success) {
        message.success('保存成功！');
        this.refreshTable();
      }
    });
  };

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
    console.log(pendingRowKeys);
    console.log(scheduleRowKeys);
  };

  render() {
    const {
      loading,
      columns,
      auditedRowKeys,
      scheduledRowKeys,
      pendingRowKeys,
      auditedData,
      scheduledData,
      pendingData,
      activeTab,
    } = this.state;
    const buildOperations = () => {
      switch (activeTab) {
        case 'Pending':
          return (
            <Button style={{ marginLeft: 10 }} onClick={this.handleAddOrder}>
              添加到排车单
            </Button>
          );
        case 'Scheduled':
          return undefined;
        default:
          return (
            <>
              <Button type={'primary'} onClick={this.dispatching}>
                排车
              </Button>
              <Button style={{ marginLeft: 10 }} onClick={this.handleAddPending}>
                添加到待定池
              </Button>
            </>
          );
      }
    };
    return (
      <Tabs
        activeKey={activeTab}
        onChange={this.handleTabChange}
        tabBarExtraContent={buildOperations()}
      >
        <TabPane tab="订单池" key="Audited">
          {/* 查询表单 */}
          <OrderPoolSearchForm refresh={this.refreshTable} />
          {/* 待排订单列表 */}
          <CardTable
            scrollY={540}
            clickRow
            loading={loading}
            changeSelectRows={this.tableChangeRows('Audited')}
            selectedRowKeys={auditedRowKeys}
            dataSource={auditedData}
            columns={OrderColumns}
          />
          {/* 排车modal */}
          <DispatchingCreatePage
            modal={{ title: '排车' }}
            refresh={() => {
              this.refreshTable();
              this.props.refresh();
            }}
            onRef={node => (this.createPageModalRef = node)}
          />
        </TabPane>
        <TabPane tab="已排订单" key="Scheduled">
          {/* 已排列表 */}
          <CardTable
            scrollY={540}
            pagination
            loading={loading}
            changeSelectRows={this.tableChangeRows('Scheduled')}
            selectedRowKeys={scheduledRowKeys}
            dataSource={scheduledData}
            columns={OrderColumns}
          />
        </TabPane>
        <TabPane tab="待定订单" key="Pending">
          {/* 待定列表 */}
          <CardTable
            scrollY={540}
            clickRow
            loading={loading}
            changeSelectRows={this.tableChangeRows('Pending')}
            selectedRowKeys={pendingRowKeys}
            dataSource={pendingData}
            columns={OrderColumns}
          />
        </TabPane>
      </Tabs>
    );
  }
}
