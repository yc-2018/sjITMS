/*
 * @Author: guankongjin
 * @Date: 2022-03-30 16:34:02
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-11-16 17:32:24
 * @Description: 订单池面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\OrderPoolPage.js
 */
import React, { Component } from 'react';
import { Switch, Button, Row, Col, Tabs, message, Typography, Icon } from 'antd';
import DispatchingTable from './DispatchingTable';
import DispatchingChildTable from './DispatchingChildTable';
import {
  OrderColumns,
  OrderCollectColumns,
  OrderDetailColumns,
  pagination,
} from './DispatchingColumns';
import OrderPoolSearchForm from './OrderPoolSearchForm';
import DispatchingCreatePage from './DispatchingCreatePage';
import DispatchMap from '@/pages/SJTms/MapDispatching/dispatching/DispatchingMap';
import dispatchingStyles from './Dispatching.less';
import { queryAuditedOrder, getOrderByStat, savePending } from '@/services/sjitms/OrderBill';
import { addOrders } from '@/services/sjitms/ScheduleBill';
import { groupBy, sumBy, uniqBy, isEmpty } from 'lodash';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import mapIcon from '@/assets/common/map.svg';

const { Text } = Typography;
const { TabPane } = Tabs;

export default class OrderPoolPage extends Component {
  state = {
    loading: false,
    auditedData: [],
    searchPagination: false,
    pageFilter: [],
    auditedCollectData: [],
    scheduledData: [],
    auditedParentRowKeys: [],
    auditedRowKeys: [],
    scheduledRowKeys: [],
    activeTab: 'Audited',
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOrderCollect != this.props.isOrderCollect) {
      this.setState({
        auditedParentRowKeys: [],
        auditedRowKeys: [],
      });
    }
  }

  //刷新
  refreshTable = () => {
    const { activeTab } = this.state;
    switch (activeTab) {
      case 'Scheduled':
        this.getScheduledOrders(activeTab);
        break;
      default:
        this.refreshOrderPool();
        break;
    }
  };

  refreshOrderPool = (params, pages, sorter) => {
    this.setState({ loading: true });
    let { pageFilter, searchPagination } = this.state;
    let filter = { superQuery: { matchType: 'and', queryParams: [] } };
    if (params) {
      if (params.superQuery) {
        filter = params;
        pageFilter = params.superQuery.queryParams;
      } else {
        pageFilter = params;
      }
    }
    const isOrgQuery = [
      { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
      { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
    ];
    if (sorter && sorter.column)
      filter.order =
        (sorter.column.sorterCode ? sorter.columnKey + 'Code' : sorter.columnKey) +
        ',' +
        sorter.order;
    if (pages) {
      filter.page = pages.current;
      filter.pageSize = pages.pageSize;
    } else {
      filter.page = searchPagination.current;
      filter.pageSize = searchPagination.pageSize || 200;
    }
    filter.superQuery.queryParams = [
      ...pageFilter,
      ...isOrgQuery,
      { field: 'STAT', type: 'VarChar', rule: 'in', val: 'Audited||PartScheduled' },
      { field: 'PENDINGTAG', type: 'VarChar', rule: 'eq', val: 'Normal' },
    ];
    queryAuditedOrder(filter).then(response => {
      if (response.success) {
        searchPagination = {
          ...pagination,
          total: response.data.paging.recordCount,
          pageSize: response.data.paging.pageSize,
          current: response.data.page,
          showTotal: total => `共 ${total} 条`,
        };
        const data = response.data.records ? response.data.records : [];
        this.setState({
          searchPagination,
          auditedData: data,
          auditedCollectData: this.groupData(data),
          auditedParentRowKeys: [],
          auditedRowKeys: [],
          scheduledRowKeys: [],
          activeTab: 'Audited',
        });
      }
      this.props.refreshSelectRowOrder([], ['Audited', 'PartScheduled']);
      this.setState({ loading: false, pageFilter });
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
    let output = groupBy(data, x => x.deliveryPoint.code);
    let deliveryPointGroupArr = Object.keys(output).map(pointCode => {
      const orders = output[pointCode];
      return {
        pointCode,
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
        volume: Math.round(sumBy(orders, 'volume') * 1000) / 1000,
        weight: Math.round(sumBy(orders, 'weight') * 1000) / 1000,
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
  tableChangeRows = (tableType, selectedRowKeys) => {
    switch (tableType) {
      case 'Scheduled':
        this.setState({ scheduledRowKeys: selectedRowKeys });
        break;
      default:
        const { auditedData } = this.state;
        this.props.refreshSelectRowOrder(
          auditedData.filter(x => selectedRowKeys.indexOf(x.uuid) != -1),
          ['Audited', 'PartScheduled']
        );
        this.setState({ auditedRowKeys: selectedRowKeys });
        break;
    }
  };

  childTableChangeRows = result => {
    const { auditedData } = this.state;
    const totalAuditedData = auditedData.filter(
      x => result.childSelectedRowKeys.indexOf(x.uuid) != -1
    );
    this.props.refreshSelectRowOrder(totalAuditedData, ['Audited', 'PartScheduled']);
    this.setState({
      auditedParentRowKeys: result.selectedRowKeys,
      auditedRowKeys: result.childSelectedRowKeys,
    });
  };

  //排车
  dispatching = () => {
    const { auditedRowKeys, auditedData } = this.state;
    const selectPending = this.props.selectPending();
    if (auditedRowKeys.length + selectPending.length == 0) {
      message.warning('请选择运输订单！');
      return;
    }
    let orders = auditedData ? auditedData.filter(x => auditedRowKeys.indexOf(x.uuid) != -1) : [];
    orders = [...orders, ...selectPending];
    //订单类型校验
    const orderType = uniqBy(orders.map(x => x.orderType));
    if (orderType.includes('Returnable') && orderType.some(x => x != 'Returnable')) {
      message.error('门店退货类型运输订单不能与其它类型订单混排，请检查！');
      return;
    }
    if (orderType.includes('TakeDelivery') && orderType.some(x => x != 'TakeDelivery')) {
      message.error('提货类型运输订单不能与其它类型订单混排，请检查！');
      return;
    }
    //不可共配校验
    let owners = orders.map(x => {
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
    this.createPageModalRef.show(false, orders);
  };

  //地图排车
  dispatchingByMap = orders => {
    // if (orders.length <= 0) {
    //   message.warning('请选择门店！');
    //   return;
    // }
    //订单类型校验
    const orderType = uniqBy(orders.map(x => x.orderType));
    if (orderType.includes('Returnable') && orderType.some(x => x != 'Returnable')) {
      message.error('门店退货类型运输订单不能与其它类型订单混排，请检查！');
      return;
    }
    if (orderType.includes('TakeDelivery') && orderType.some(x => x != 'TakeDelivery')) {
      message.error('提货类型运输订单不能与其它类型订单混排，请检查！');
      return;
    }
    //不可共配校验
    let owners = [...orders].map(x => {
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
    // this.setState({ mapModal: false });
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
        this.props.refreshPending();
      }
    });
  };

  //添加到排车单
  handleAddOrder = () => {
    const { auditedRowKeys } = this.state;
    const scheduleRowKeys = this.props.scheduleRowKeys();
    if (scheduleRowKeys == undefined || scheduleRowKeys.length != 1) {
      message.warning('请选择一张排车单！');
      return;
    }
    if (auditedRowKeys == undefined || auditedRowKeys.length == 0) {
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
    const { totalOrder } = this.props;
    let selectOrders = this.groupByOrder(totalOrder);
    const totalTextStyle = { fontSize: 16, fontWeight: 700, marginLeft: 2, color: '#333' };
    return (
      <Row type="flex" style={{ fontSize: 14 }}>
        <Col span={4}>
          <Text> 总件数:</Text>
          <Text style={totalTextStyle}>
            {Number(selectOrders.realCartonCount) +
              Number(selectOrders.realScatteredCount) +
              Number(selectOrders.realContainerCount) * 2}
          </Text>
        </Col>
        <Col span={4}>
          <Text> 整件:</Text>
          <Text style={totalTextStyle}>{selectOrders.realCartonCount}</Text>
        </Col>
        <Col span={4}>
          <Text> 散件:</Text>
          <Text style={totalTextStyle}>{selectOrders.realScatteredCount}</Text>
        </Col>
        <Col span={4}>
          <Text> 周转筐:</Text>
          <Text style={totalTextStyle}>{selectOrders.realContainerCount}</Text>
        </Col>
        <Col span={4}>
          <Text> 体积:</Text>
          <Text style={totalTextStyle}>{selectOrders.volume.toFixed(2)}</Text>
        </Col>
        <Col span={4}>
          <Text> 重量:</Text>
          <Text style={totalTextStyle}>{(selectOrders.weight / 1000).toFixed(2)}</Text>
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
    data = data.map(x => {
      if (x.orderNumber) {
        x.stillCartonCount = x.cartonCount;
        x.stillScatteredCount = x.scatteredCount;
        x.stillContainerCount = x.containerCount;
      }
      return x;
    });
    return {
      realCartonCount: Math.round(sumBy(data.map(x => x.stillCartonCount)) * 100) / 100,
      realScatteredCount: Math.round(sumBy(data.map(x => x.stillScatteredCount)) * 100) / 100,
      realContainerCount: Math.round(sumBy(data.map(x => x.stillContainerCount)) * 100) / 100,
      weight: Math.round(sumBy(data.map(x => Number(x.weight))) * 100) / 100,
      volume: Math.round(sumBy(data.map(x => Number(x.volume))) * 100) / 100,
    };
  };

  render() {
    const {
      loading,
      auditedParentRowKeys,
      auditedRowKeys,
      auditedData,
      searchPagination,
      auditedCollectData,
      scheduledRowKeys,
      scheduledData,
      activeTab,
    } = this.state;
    const { isOrderCollect } = this.props;
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
          {isOrderCollect ? (
            <DispatchingChildTable
              comId="orderPool"
              clickRow
              childSettingCol
              pagination={searchPagination || false}
              loading={loading}
              dataSource={auditedCollectData}
              refreshDataSource={(_, pagination, sorter) => {
                this.refreshOrderPool(undefined, pagination, sorter);
              }}
              changeSelectRows={this.childTableChangeRows}
              selectedRowKeys={auditedParentRowKeys}
              childSelectedRowKeys={auditedRowKeys}
              columns={OrderCollectColumns}
              nestColumns={OrderDetailColumns}
              scrollY="calc(68vh - 220px)"
              title={this.buildTitle}
            />
          ) : (
            <DispatchingTable
              comId="orderPool"
              clickRow
              pagination={searchPagination || false}
              loading={loading}
              dataSource={auditedData}
              refreshDataSource={(_, pagination, sorter) => {
                this.refreshOrderPool(undefined, pagination, sorter);
              }}
              changeSelectRows={selectedRowKeys => this.tableChangeRows('Audited', selectedRowKeys)}
              selectedRowKeys={auditedRowKeys}
              columns={OrderColumns}
              scrollY="calc(68vh - 220px)"
              title={this.buildTitle}
            />
          )}
          {auditedData.length == 0 ? (
            <></>
          ) : (
            <div className={dispatchingStyles.orderPoolFooter}>
              <div className={dispatchingStyles.orderTotalPane}>
                <Icon type="info-circle" theme="filled" twoToneColor="#3B77E3" />
                <span style={{ marginLeft: 5 }}>
                  已选择
                  <span style={{ color: '#3B77E3', margin: '0 2px' }}>{auditedRowKeys.length}</span>
                  项
                </span>
                <a
                  href="#"
                  style={{ marginLeft: 10 }}
                  onClick={() => {
                    this.tableChangeRows(_, []);
                    if (isOrderCollect) {
                      this.setState({ auditedParentRowKeys: [] });
                    }
                  }}
                >
                  取消全部
                </a>
              </div>
            </div>
          )}
          <div style={{ position: 'absolute', top: 12, left: 160 }}>
            <a href="#" onClick={() => this.dispatchMapRef.show()}>
              <img src={mapIcon} style={{ width: 20, height: 20 }} />
              地图
            </a>
            <Switch
              style={{ marginLeft: 15 }}
              checked={this.props.isOrderCollect}
              checkedChildren="门店汇总"
              unCheckedChildren="门店汇总"
              onClick={isOrderCollect => {
                this.props.refreshOrderCollect(isOrderCollect);
              }}
            />
          </div>
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
          <DispatchMap
            dispatchingByMap={this.dispatchingByMap}
            onRef={node => (this.dispatchMapRef = node)}
          />
        </TabPane>
        <TabPane
          tab={<Text className={dispatchingStyles.cardTitle}>已排订单</Text>}
          key="Scheduled"
        >
          {/* 已排列表 */}
          <DispatchingTable
            comId="scheduleOrder"
            clickRow
            pagination={pagination}
            loading={loading}
            dataSource={scheduledData}
            refreshDataSource={scheduledData => {
              this.tableChangeRows('Scheduled', []);
              this.setState({ scheduledData });
            }}
            changeSelectRows={selectedRowKeys => this.tableChangeRows('Scheduled', selectedRowKeys)}
            selectedRowKeys={scheduledRowKeys}
            columns={[{ title: '排车单号', dataIndex: 'scheduleNum', width: 150 }, ...OrderColumns]}
            scrollY="calc(68vh - 115px)"
          />
        </TabPane>
      </Tabs>
    );
  }
}
