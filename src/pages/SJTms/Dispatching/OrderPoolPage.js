/*
 * @Author: guankongjin
 * @Date: 2022-03-30 16:34:02
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-07-09 11:05:44
 * @Description: 订单池面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\OrderPoolPage.js
 */
import React, { Component } from 'react';
import { Button, Row, Col, Tabs, message, Typography } from 'antd';
import DispatchingTable from './DispatchingTable';
import { OrderColumns, pagination } from './DispatchingColumns';
import OrderPoolSearchForm from './OrderPoolSearchForm';
import RyzeSettingDrowDown from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeSettingDrowDown/RyzeSettingDrowDown';
import DispatchingCreatePage from './DispatchingCreatePage';
import dispatchingStyles from './Dispatching.less';
import {
  queryAuditedOrder,
  getAuditedOrder,
  getOrderByStat,
  savePending,
} from '@/services/sjitms/OrderBill';
import { addOrders } from '@/services/sjitms/ScheduleBill';
import { isEmpty } from '@/utils/utils';
import { groupBy, sumBy, uniq, uniqBy } from 'lodash';
import { string } from 'prop-types';

const { Text } = Typography;
const { TabPane } = Tabs;

export default class OrderPoolPage extends Component {
  state = {
    searchKeyValues: { orderType: 'Delivery' },
    loading: false,
    orderPoolColumns: [...OrderColumns],
    auditedData: [],
    scheduledData: [],
    auditedRowKeys: [],
    scheduledRowKeys: [],
    activeTab: 'Audited',
  };

  componentDidMount() {
    this.orderColSetting.handleOK();
    this.refreshTable();
  }

  //刷新
  refreshTable = searchKeyValues => {
    if (searchKeyValues == undefined) {
      searchKeyValues = this.state.searchKeyValues;
    }
    const { activeTab } = this.state;
    switch (activeTab) {
      case 'Scheduled':
        this.getScheduledOrders(activeTab);
        break;
      default:
        this.getAuditedOrders(searchKeyValues, activeTab);
        break;
    }
  };

  refreshOrderPool = params => {
    this.setState({ loading: true });
    queryAuditedOrder(params).then(response => {
      if (response.success) {
        this.setState({
          loading: false,
          auditedData: response.data,
          auditedRowKeys: [],
          scheduledRowKeys: [],
        });
      }
    });
  };

  //获取待排运输订单
  getAuditedOrders = (searchKeyValues, activeKey) => {
    this.setState({ loading: true });
    getAuditedOrder(searchKeyValues).then(response => {
      if (response.success) {
        this.setState({
          searchKeyValues,
          loading: false,
          auditedData: response.data,
          auditedRowKeys: [],
          scheduledRowKeys: [],
          activeTab: activeKey,
        });
      }
    });
  };
  //获取已排运输订单
  getScheduledOrders = activeKey => {
    this.setState({ activeTab: activeKey, loading: true });
    getOrderByStat(activeKey).then(response => {
      if (response.success) {
        this.setState({
          loading: false,
          scheduledData: response.data,
          auditedRowKeys: [],
          scheduledRowKeys: [],
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
    return selectedRowKeys => {
      switch (tableType) {
        case 'Scheduled':
          this.setState({ scheduledRowKeys: selectedRowKeys });
          break;
        default:
          const { auditedData } = this.state;
          this.props.refreshSelectRowOrder(
            auditedData.filter(x => selectedRowKeys.indexOf(x.uuid) != -1),
            'Audited'
          );
          this.setState({ auditedRowKeys: selectedRowKeys });
          break;
      }
    };
  };

  //排车
  dispatching = () => {
    const { auditedRowKeys, auditedData } = this.state;
    const selectPending = this.props.selectPending();
    if (auditedRowKeys.length + selectPending.length == 0) {
      message.warning('请选择运输订单！');
      return;
    }
    const orders = auditedData ? auditedData.filter(x => auditedRowKeys.indexOf(x.uuid) != -1) : [];
    //不可共配校验
    let owners = [...orders, ...selectPending].map(x => {
      return { ...x.owner, noJointlyOwnerCodes: x.noJointlyOwnerCode };
    });
    owners = uniqBy(owners, 'uuid');
    const checkOwners = owners.filter(x => x.noJointlyOwnerCodes);
    let noJointlyOwner = undefined;
    checkOwners.forEach(owner => {
      //不可共配货主
      const noJointlyOwnerCodes = owner.noJointlyOwnerCodes.split(',');
      const noJointlyOwners = owners.filter(
        x => noJointlyOwnerCodes.indexOf(x.code) != -1 && x.code != owner.code
      );
      if (noJointlyOwners.length > 0) {
        noJointlyOwner = {
          ownerName: owner.name,
          owners: noJointlyOwners.map(x => x.name).join(','),
        };
      }
    });
    if (noJointlyOwner != undefined) {
      message.error(
        '货主：' +
          noJointlyOwner.ownerName +
          '与[' +
          noJointlyOwner.owners +
          ']不可共配，请检查货主配置!'
      );
      return;
    }
    this.createPageModalRef.show(false, [...orders, ...selectPending]);
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
        this.props.refreshPending();
      }
    });
  };

  //添加到排车单
  handleAddOrder = () => {
    const { auditedRowKeys } = this.state;
    const scheduleRowKeys = this.props.scheduleRowKeys();
    if (scheduleRowKeys.length != 1 || scheduleRowKeys == undefined) {
      message.warning('请选择一张排车单！');
      return;
    }
    if (auditedRowKeys.length == 0 || auditedRowKeys == undefined) {
      message.warning('请选择待定运输订单！');
      return;
    }
    addOrders({ billUuid: scheduleRowKeys[0], orderUuids: auditedRowKeys }).then(response => {
      if (response.success) {
        message.success('保存成功！');
        this.refreshTable();
        this.props.refreshSchedule();
      }
    });
  };

  //汇总数据
  buildTitle = () => {
    const { auditedRowKeys } = this.state;
    const { totalOrder } = this.props;
    let selectOrders = this.groupByOrder(totalOrder);
    const totalTextStyle = { fontSize: 16, fontWeight: 700 };
    return (
      <Row type="flex" style={{ fontSize: 14, marginLeft: 5 }}>
        <Col span={3} style={{ textAlign: 'left' }}>
          <Text>
            已选：
            {auditedRowKeys.length}
          </Text>
        </Col>
        <Col span={4}>
          <Text> 整件：</Text>
          <Text style={totalTextStyle}>{selectOrders.realCartonCount}</Text>
        </Col>
        <Col span={4}>
          <Text> 散件：</Text>
          <Text style={totalTextStyle}>{selectOrders.realScatteredCount}</Text>
        </Col>
        <Col span={3}>
          <Text> 周转筐：</Text>
          <Text style={totalTextStyle}>{selectOrders.realContainerCount}</Text>
        </Col>
        <Col span={5}>
          <Text> 体积：</Text>
          <Text style={totalTextStyle}>{selectOrders.volume.toFixed(2)}</Text>
        </Col>
        <Col span={5}>
          <Text> 重量：</Text>
          <Text style={totalTextStyle}>{selectOrders.weight.toFixed(2)}</Text>
        </Col>
      </Row>
    );
  };
  //计算汇总
  groupByOrder = data => {
    data = data.filter(x => x.orderType !== 'OnlyBill');
    if (data.length == 0) {
      return {
        realCartonCount: 0,
        realScatteredCount: 0,
        realContainerCount: 0,
        volume: 0,
        weight: 0,
      };
    }
    return {
      realCartonCount: sumBy(data.map(x => x.realCartonCount)),
      realScatteredCount: sumBy(data.map(x => x.realScatteredCount)),
      realContainerCount: sumBy(data.map(x => x.realContainerCount)),
      weight: sumBy(data.map(x => Number(x.weight))),
      volume: sumBy(data.map(x => Number(x.volume))),
    };
  };

  //更新列配置
  setColumns = (orderPoolColumns, index, width) => {
    this.orderColSetting.handleWidth(index, width);
    this.setState({ orderPoolColumns });
  };

  render() {
    const {
      loading,
      orderPoolColumns,
      auditedRowKeys,
      scheduledRowKeys,
      auditedData,
      scheduledData,
      activeTab,
    } = this.state;
    const buildOperations = () => {
      switch (activeTab) {
        case 'Scheduled':
          return undefined;
        default:
          return (
            <>
              <Button type={'primary'} onClick={this.dispatching}>
                排车
              </Button>
              <Button style={{ marginLeft: 10 }} onClick={() => this.handleAddOrder()}>
                添加到排车单
              </Button>
              <Button style={{ marginLeft: 10 }} onClick={this.handleAddPending}>
                添加到待定池
              </Button>
            </>
          );
      }
    };

    const settingColumn = (
      <RyzeSettingDrowDown
        columns={OrderColumns}
        comId={'OrderPoolColumns'}
        getNewColumns={this.setColumns}
        onRef={ref => (this.orderColSetting = ref)}
      />
    );

    return (
      <Tabs
        activeKey={activeTab}
        onChange={this.handleTabChange}
        tabBarExtraContent={buildOperations()}
      >
        <TabPane tab={<Text className={dispatchingStyles.cardTitle}>订单池</Text>} key="Audited">
          {/* 查询表单 */}
          <OrderPoolSearchForm
            refresh={this.refreshTable}
            refreshOrderPool={this.refreshOrderPool}
          />
          {/* 待排订单列表 */}
          <DispatchingTable
            clickRow
            pagination={pagination}
            setColumns={this.setColumns}
            children={settingColumn}
            loading={loading}
            dataSource={auditedData}
            refreshDataSource={auditedData => {
              this.setState({ auditedData });
            }}
            changeSelectRows={this.tableChangeRows('Audited')}
            selectedRowKeys={auditedRowKeys}
            columns={orderPoolColumns}
            scrollY="calc(68vh - 220px)"
            title={this.buildTitle}
          />
          {/* 排车modal */}
          <DispatchingCreatePage
            modal={{ title: '排车' }}
            refresh={() => {
              this.refreshTable();
              this.props.refreshPending();
              this.props.refreshSchedule();
            }}
            onRef={node => (this.createPageModalRef = node)}
          />
        </TabPane>
        <TabPane
          tab={<Text className={dispatchingStyles.cardTitle}>已排订单</Text>}
          key="Scheduled"
        >
          {/* 已排列表 */}
          <DispatchingTable
            clickRow
            pagination={pagination}
            setColumns={this.setColumns}
            children={settingColumn}
            loading={loading}
            dataSource={scheduledData}
            refreshDataSource={scheduledData => {
              this.setState({ scheduledData });
            }}
            changeSelectRows={this.tableChangeRows('Scheduled')}
            selectedRowKeys={scheduledRowKeys}
            columns={[
              { title: '排车单号', dataIndex: 'scheduleNum', width: 150 },
              ...orderPoolColumns,
            ]}
            scrollY="calc(68vh - 115px)"
          />
        </TabPane>
      </Tabs>
    );
  }
}
