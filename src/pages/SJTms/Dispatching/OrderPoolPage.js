/*
 * @Author: guankongjin
 * @Date: 2022-03-30 16:34:02
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-12 08:54:04
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
import { OrderColumns } from './DispatchingColumns';
import DispatchingCreatePage from './DispatchingCreatePage';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { queryData } from '@/services/quick/Quick';
import { groupBy, sumBy } from 'lodash';

const { TabPane } = Tabs;
let queryParams = [
  { field: 'dispatchCenterUuid', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
  { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
];
@connect(({ loading }) => ({ loading: loading.models.quick }))
@Form.create()
export default class OrderPoolPage extends Component {
  state = {
    auditedData: [],
    scheduledData: [],
    pendingData: [],
    selectedRowKeys: [],
    selectedPendingRowKeys: [],
  };
  auditedTable = React.createRef();

  componentDidMount() {
    this.getAuditedOrders();
  }

  //搜索
  onSearch = event => {
    const { form } = this.props;
    const { pageFilter } = this.state;
    event.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const data = {
        ...fieldsValue,
      };
      queryParams.push({ field: 'ORDERTYPE', type: 'VarChar', rule: 'eq', val: data.orderType });
      this.getAuditedOrders();
    });
  };
  //重置
  handleReset = () => {
    this.props.form.resetFields();
  };

  //获取待排运输订单
  getAuditedOrders = () => {
    queryParams.push({ field: 'STAT', type: 'VarChar', rule: 'eq', val: 'Audited' });
    queryData({ quickuuid: 'sj_itms_order', superQuery: { queryParams } }).then(response => {
      if (response.success) {
        this.setState({ auditedData: response.data.records });
      }
    });
  };

  //按送货点汇总运输订单
  groupData = data => {
    let output = groupBy(data, 'DELIVERYPOINTCODE');
    let deliveryPointGroupArr = Object.keys(output).map(pointCode => {
      const orders = output[pointCode];
      return {
        pointCode,
        orderStat: orders[0].STAT_CN,
        archLineCode: '',
        deliveryPoint: `[${orders[0].DELIVERYPOINTCODE}]` + orders[0].DELIVERYPOINTNAME,
        address: orders[0].DELIVERYPOINTADDRESS,
        cartonCount: sumBy(orders, 'CARTONCOUNT') + '/' + sumBy(orders, 'REALCARTONCOUNT'),
        scatteredCount: sumBy(orders, 'SCATTEREDCOUNT') + '/' + sumBy(orders, 'REALSCATTEREDCOUNT'),
        containerCount: sumBy(orders, 'CONTAINERCOUNT') + '/' + sumBy(orders, 'REALCONTAINERCOUNT'),
        volume: sumBy(orders, 'FORECASTVOLUME') + '/' + sumBy(orders, 'REALVOLUME'),
        weight: sumBy(orders, 'FORECASTWEIGHT') + '/' + sumBy(orders, 'REALWEIGHT'),
        owner: orders[0].OWNER,
      };
    });
    deliveryPointGroupArr.forEach(data => {
      data.items = output[data.pointCode];
    });
    return deliveryPointGroupArr;
  };

  //排车
  dispatching = () => {
    const { selectedRowKeys } = this.auditedTable.current.state;
    if (selectedRowKeys.length == 0) {
      message.warning('请选择运输订单！');
      return;
    }
    this.setState({ selectedRowKeys });
    this.createPageModalRef.show();
  };

  render() {
    const { columns, auditedData, selectedRowKeys, scheduledData, pendingData } = this.state;
    const { getFieldDecorator } = this.props.form;
    const operations = (
      <Button type={'primary'} onClick={() => this.dispatching()}>
        排车
      </Button>
    );
    return (
      <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
        <TabPane tab="待排" key="1">
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
                    <Input placeholder="请选择线路" />
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
            rowSelect
            ref={this.auditedTable}
            dataSource={auditedData}
            columns={OrderColumns}
          />
          {/* 排车modal */}
          <DispatchingCreatePage
            modal={{ title: '排车' }}
            data={auditedData.filter(x => selectedRowKeys.indexOf(x.UUID) != -1)}
            onRef={node => (this.createPageModalRef = node)}
          />
        </TabPane>
        <TabPane tab="已排" key="2">
          {/* 已排列表 */}
          <CardTable scrollY={540} pagination dataSource={scheduledData} columns={OrderColumns} />
        </TabPane>
        <TabPane tab="待定" key="3">
          {/* 待定列表 */}
          <CardTable scrollY={540} rowSelect dataSource={pendingData} columns={OrderColumns} />
        </TabPane>
      </Tabs>
    );
  }
}
