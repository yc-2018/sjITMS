/*
 * @Author: guankongjin
 * @Date: 2022-03-30 16:34:02
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-28 08:52:59
 * @Description: 订单池面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\OrderPoolPage.js
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Tabs, Button, Form, Input, Row, Col, message } from 'antd';
import {
  SimpleTreeSelect,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import CardTable from './CardTable';
import { OrderColumns, OrderDetailColumns } from './DispatchingColumns';
import DispatchingCreatePage from './DispatchingCreatePage';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import {
  getOrder,
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
@Form.create()
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

  //保存刷新订单池和排车单表格
  refreshOrderPool = () => {
    this.refreshTable();
  };

  //搜索
  onSearch = event => {
    const { form } = this.props;
    const { pageFilter } = this.state;
    event.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const searchKeyValues = { orderType: fieldsValue.orderType.value };
      this.getAuditedOrders(searchKeyValues);
    });
  };
  //重置
  handleReset = () => {
    this.props.form.resetFields();
    this.refreshTable();
  };
  //刷新
  refreshTable = () => {
    const searchKeyValues = { orderType: 'Delivery' };
    this.getAuditedOrders(searchKeyValues);
  };

  //获取待排运输订单
  getAuditedOrders = searchKeyValues => {
    this.setState({ loading: true });
    getOrder(searchKeyValues).then(response => {
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
  getScheduledOrders = activeKey => {
    this.setState({ loading: true });
    getOrderByStat('Scheduled').then(response => {
      if (response.success) {
        this.setState({
          loading: false,
          scheduledData: response.data,
          ...initRowKeys,
          activeTab: activeKey,
        });
      }
    });
  };
  //获取待排运输订单
  getPendingOrders = activeKey => {
    this.setState({ loading: true });
    getOrderInPending().then(response => {
      if (response.success) {
        this.setState({
          loading: false,
          pendingData: response.data,
          ...initRowKeys,
          activeTab: activeKey,
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
    switch (activeKey) {
      case 'Pending':
        this.getPendingOrders(activeKey);
        break;
      case 'Scheduled':
        this.getScheduledOrders(activeKey);
        break;
      default:
        this.setState({ activeTab: activeKey });
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
    const { auditedRowKeys } = this.state;
    if (auditedRowKeys.length == 0) {
      message.warning('请选择运输订单！');
      return;
    }
    this.createPageModalRef.show();
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
        this.getAuditedOrders(this.state.activeTab);
      }
    });
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
    const { getFieldDecorator } = this.props.form;
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
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onSubmit={this.onSearch}
            autoComplete="off"
          >
            <Row justify="space-around">
              <Col span={8}>
                <Form.Item label="线路">
                  {getFieldDecorator('shipGroupCode', { initialValue: '' })(
                    <SimpleTreeSelect
                      placeholder="请选择线路"
                      textField="[%CODE%]%NAME%"
                      valueField="UUID"
                      parentField="PARENTUUID"
                      queryParams={{ tableName: 'SJ_ITMS_LINE' }}
                      treeDefaultExpandAll={true}
                      multiSave="PARENTUUID:UUID"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="单据类型">
                  {getFieldDecorator('orderType', { initialValue: 'Delivery' })(
                    <SimpleAutoComplete
                      placeholder="请选择单据类型"
                      dictCode="orderType"
                      allowClear={false}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8} style={{ float: 'right' }}>
                <Button
                  type={'primary'}
                  style={{ marginLeft: 12 }}
                  loading={this.props.loading}
                  htmlType="submit"
                >
                  查询
                </Button>
                <Button style={{ marginLeft: 10 }} onClick={this.handleReset}>
                  重置
                </Button>
              </Col>
            </Row>
          </Form>
          {/* 待排订单列表 */}
          <CardTable
            scrollY={540}
            clickRow
            loading={loading}
            changeSelectRows={this.tableChangeRows('Audited')}
            selectedRowKeys={auditedRowKeys}
            dataSource={auditedData}
            columns={OrderColumns}
            // hasChildTable
            // nestColumns={OrderDetailColumns}
          />
          {/* 排车modal */}
          <DispatchingCreatePage
            modal={{ title: '排车' }}
            data={auditedData ? auditedData.filter(x => auditedRowKeys.indexOf(x.uuid) != -1) : []}
            refresh={this.refreshOrderPool}
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
