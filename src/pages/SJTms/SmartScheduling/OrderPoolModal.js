// ———————————————————— 【智能调度】订单池弹窗 ——————————————————————
import React, { Component } from 'react';
import { groupBy, orderBy, sumBy } from 'lodash';
import { Col, Modal, Row, Tooltip } from 'antd';
import SearchForm from '@/pages/SJTms/Dispatching/SearchForm';
import { queryAuditedOrder, queryCollectAuditedOrder } from '@/services/sjitms/OrderBill';
import {
  OrderCollectColumns,
  OrderColumns,
  OrderDetailColumns,
  pagination
} from '@/pages/SJTms/Dispatching/DispatchingColumns';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import DispatchingChildTable from '@/pages/SJTms/Dispatching/DispatchingChildTable';
import DispatchingTable from '@/pages/SJTms/Dispatching/DispatchingTable';
import { getDispatchConfig } from '@/services/sjtms/DispatcherConfig';
import { checkBaseData } from '@/services/sjitms/ScheduleBill';

export default class OrderPoolModal extends Component {
  state = {
    loading: false,
    auditedData: [],
    searchPagination: false,
    pageFilter: [],
    auditedCollectData: [],
    auditedParentRowKeys: [],
    auditedRowKeys: [],
    waveOrder: {},
    comId: 'orderPool',
    searchKey: 'orderPoolSearch',

    selectOrders: [],
    dispatchConfig: {},
    isOrderCollect: true,
    isOrderCollectType: 0,
  };
  isOrgQuery = [
    { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
    { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
  ];

  async componentDidMount () {
    const response = await getDispatchConfig(loginOrg().uuid);
    if (response.success) {
      this.setState({
        dispatchConfig: response.data,
        isOrderCollect: response.data?.isSumOrder !== 0,
        isOrderCollectType: response.data?.isSumOrder,
      });
    }
    const checkBase = await checkBaseData(loginCompany().uuid, loginOrg().uuid);
    if (checkBase && checkBase.success) {
      if (checkBase.data && checkBase.data?.length > 0) {
        Modal.confirm({
          title: (
            <span>
              门店代码:
              <p style={{ color: 'blue' }}>{checkBase.data.join(',')}</p>
              存在组队、到货类型、配送区域、高速线路区域补贴区域、信息为空
            </span>)
        });
      }
    }
  }

  refreshOrderPool = (params, pages, sorter) => {
    this.setState({ loading: true });
    if (params && !params.superQuery) {
      let orderType = params?.find(e => e.field === 'ORDERTYPE');
      if (orderType && orderType.val.split('||').indexOf('TakeDelivery') !== -1) {
        this.setState({ comId: 'orderTakeDelivery' });
      } else {
        this.setState({ comId: 'orderPool' });
      }
    }

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
    if (sorter && sorter.column) {
      filter.order = `${sorter.column.sorterCode ? `${sorter.columnKey}Code` : sorter.columnKey},${sorter.order}`;
    }
    if (pages) {
      filter.page = pages.current;
      filter.pageSize = pages.pageSize;
      // 设置页码缓存
      localStorage.setItem('OrderPoolPageSize', filter.pageSize);
    } else {
      // 增加查询页数从缓存中读取
      let pageSize = localStorage.getItem('OrderPoolPageSize')
        ? parseInt(localStorage.getItem('OrderPoolPageSize'), 10)
        : 100;
      filter.page = searchPagination.current;
      filter.pageSize = searchPagination.pageSize || pageSize;
    }
    filter.superQuery.queryParams = [
      ...pageFilter,
      ...this.isOrgQuery,
      { field: 'STAT', type: 'VarChar', rule: 'in', val: 'Audited||PartScheduled' },
      { field: 'PENDINGTAG', type: 'VarChar', rule: 'eq', val: 'Normal' },
    ];
    queryAuditedOrder(filter).then(async response => {
      if (response.success) {
        searchPagination = {
          ...pagination,
          total: response.data.paging.recordCount,
          pageSize: response.data.paging.pageSize,
          current: response.data.page,
          showTotal: total => `共 ${total} 条`,
        };
        let data = response.data.records ? response.data.records : [];
        const collectResponse = this.state.dispatchConfig?.isShowSum
          ? await queryCollectAuditedOrder(filter)
          : {};
        data = data?.map(order => {
          const cartonCount = order.realCartonCount || order.cartonCount;
          order.warning = order.stillCartonCount < cartonCount;
          return order;
        });
        this.setState({
          searchPagination,
          auditedData: data,
          auditedCollectData: this.groupData(data, sorter),
          auditedParentRowKeys: [],
          auditedRowKeys: [],
          waveOrder: collectResponse.success ? collectResponse.data : {},
        });
      }
      this.refreshSelectRowOrder([], ['Audited', 'PartScheduled']);
      this.setState({ loading: false, pageFilter });
    });
  };

  /** 【选订单弹窗方法】保存选中订单，用于选中订单汇总 */
  refreshSelectRowOrder = (orders, stat) => {
    const { selectOrders } = this.state;
    let tempSelectOrders = selectOrders.filter(x => stat.indexOf(x.stat) === -1);
    this.setState({ selectOrders: [...tempSelectOrders, ...orders] });
  };

  /** 按送货点汇总运输订单 */
  groupData = (data, sorter) => {
    const { isOrderCollectType } = this.state;
    let output;
    // 按波次号+门店号合并
    if (isOrderCollectType === 2) {
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
        deliveryPointCode: orders[0].deliveryPoint?.code,
        archLine: orders[0].archLine,
        archLineCode: orders[0].archLine?.code,
        owner: orders[0].owner,
        ownerCode: orders[0].owner?.code,
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
        insulatedBagCount: Math.round(sumBy(orders, 'insulatedBagCount') * 1000) / 1000,

        volume: Math.round(sumBy(orders, 'volume') * 1000) / 1000,
        weight: Math.round(sumBy(orders, 'weight') * 1000) / 1000,
        shipAreaName: orders[0].shipAreaName,
        tmsNote: orders[0].tmsNote,
      };
    });
    deliveryPointGroupArr.forEach(item => item.details = output[item.pointCode]);
    deliveryPointGroupArr = orderBy(deliveryPointGroupArr, 'archLineCode');
    if (sorter && sorter.column) {
      deliveryPointGroupArr = orderBy(
        deliveryPointGroupArr,
        [sorter.column.sorterCode ? `${sorter.columnKey}Code` : sorter.columnKey],
        [sorter.order.replace('end', '')]
      );
    }
    return deliveryPointGroupArr;
  };

  /** 表格行选择 */
  tableChangeRows = (selectedRowKeys) => {
    const { auditedData } = this.state;
    this.refreshSelectRowOrder(
      auditedData.filter(x => selectedRowKeys.indexOf(x.uuid) !== -1),
      ['Audited', 'PartScheduled']
    );
    this.setState({ auditedRowKeys: selectedRowKeys });
  };

  /** 子表勾选改变 */
  childTableChangeRows = result => {
    const { auditedData } = this.state;
    const totalAuditedData = auditedData.filter(
      x => result.childSelectedRowKeys.indexOf(x.uuid) !== -1
    );
    this.refreshSelectRowOrder(totalAuditedData, ['Audited', 'PartScheduled']);
    this.setState({
      auditedParentRowKeys: result.selectedRowKeys,
      auditedRowKeys: result.childSelectedRowKeys,
    });
  };

  /** 汇总数据 */
  drawCollect = (footer, orders = {}) => {
    const { dispatchConfig } = this.state;
    if (!dispatchConfig?.isShowSum && footer) {
      return;
    }
    const splitSta = dispatchConfig?.orderPoolStatistics?.split(',');
    const totalTextStyle = footer
      ? {}
      : { fontSize: 16, fontWeight: 700, marginLeft: 2, color: '#333' };
    const columnStyle = {
      fontSize: 14,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    };
    const count =
      Number(orders.realCartonCount) +
      Number(orders.realScatteredCount) +
      (Number(orders.realContainerCount) + Number(orders.realColdContainerCount)) * 2 +
      Number(orders.realFreezeContainerCount) * 3 +
      Number(orders.realInsulatedBagCount) +
      Number(orders.realFreshContainerCount);
    const vehicleCount = Math.ceil(count / dispatchConfig.calvehicle);
    const vehicleCount1 = Math.ceil(orders.weight / (dispatchConfig.calvehicle1 / 1000));
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ fontSize: 14, width: '15%' }}>
          总件数:
          <span style={totalTextStyle}>{count}</span>
        </div>
        {footer && dispatchConfig.calvehicle && dispatchConfig.calvehicle > 0 ? (
          <Tooltip
            title={
              <div>
                <div style={{ border: '1px dashed #FFF', padding: 5 }}>
                  <p>
                    预排(件数)(
                    {vehicleCount}
                    车)：
                  </p>
                  <p>
                    单车体积: {Math.round((orders.volume / vehicleCount) * 1000) / 1000}
                    m³
                  </p>
                  <p>单车重量: {Math.round((orders.weight / vehicleCount) * 1000) / 1000}t</p>
                  <div>单车总件数: {Math.round((count / vehicleCount) * 100) / 100}</div>
                </div>
                <div style={{ border: '1px dashed #FFF', marginTop: 10, padding: 5 }}>
                  <p>预排(重量)({vehicleCount1}车)：</p>
                  <p>单车体积: {Math.round((orders.volume / vehicleCount1) * 1000) / 1000}m³</p>
                  <p>单车重量: {Math.round((orders.weight / vehicleCount1) * 1000) / 1000}t</p>
                  <div>单车总件数: {Math.round((count / vehicleCount1) * 100) / 100}</div>
                </div>
              </div>
            }
          >
            <div style={{ ...columnStyle, flex: 0.8 }}>
              预排:
              <span style={totalTextStyle}>{vehicleCount}</span>
            </div>
          </Tooltip>
        ) : null}
        <Row gutter={[4, 4]} style={{ width: '100%' }}>
          {splitSta?.map(data => {
            switch (data) {
              case '1':
                return (
                  <Tooltip title={orders.realCartonCount}>
                    <Col span={4} style={{ ...columnStyle, flex: 1 }}>
                      整件:
                      <span style={totalTextStyle}>{orders.realCartonCount}</span>
                    </Col>
                  </Tooltip>
                );
              case '2':
                return (
                  <Tooltip title={orders.realScatteredCount}>
                    <Col span={4} style={{ ...columnStyle, flex: 1 }}>
                      散件:
                      <span style={totalTextStyle}>{orders.realScatteredCount}</span>
                    </Col>
                  </Tooltip>
                );
              case '3':
                return (
                  <Tooltip title={orders.realContainerCount}>
                    <Col span={4} style={{ ...columnStyle, flex: 1 }}>
                      周转筐:
                      <span style={totalTextStyle}>{orders.realContainerCount}</span>
                    </Col>
                  </Tooltip>
                );
              case '4':
                return (
                  <Tooltip title={orders.realColdContainerCount}>
                    <Col span={4} style={{ ...columnStyle, flex: 1 }}>
                      保温箱:
                      <span style={totalTextStyle}>{orders.realColdContainerCount || 0}</span>
                    </Col>
                  </Tooltip>
                );
              case '5':
                return (
                  <Tooltip title={orders.volume}>
                    <Col span={4} style={{ ...columnStyle, flex: 1 }}>
                      体积:
                      <span style={totalTextStyle}>{orders.volume}</span>
                    </Col>
                  </Tooltip>
                );
              case '6':
                return (
                  <Tooltip title={orders.weight}>
                    <Col span={4} style={{ ...columnStyle, flex: 1 }}>
                      重量:
                      <span style={totalTextStyle}>{orders.weight}</span>
                    </Col>
                  </Tooltip>
                );
              case '7':
                return (
                  <Tooltip title={orders.totalStores}>
                    <Col span={4} style={{ ...columnStyle, flex: 1 }}>
                      门店:
                      <span style={totalTextStyle}>{orders.totalStores}</span>
                    </Col>
                  </Tooltip>
                );
              case '8':
                return (
                  <Tooltip title={orders.realFreezeContainerCount}>
                    <Col span={4} style={{ ...columnStyle, flex: 1 }}>
                      冷冻:
                      <span style={totalTextStyle}>{orders.realFreezeContainerCount}</span>
                    </Col>
                  </Tooltip>
                );
              case '9':
                return (
                  <Tooltip title={orders.realColdContainerCount}>
                    <Col span={4} style={{ ...columnStyle, flex: 1 }}>
                      冷藏:
                      <span style={totalTextStyle}>{orders.realColdContainerCount}</span>
                    </Col>
                  </Tooltip>
                );
              case '10':
                return (
                  <Tooltip title={orders.realInsulatedBagCount}>
                    <Col span={4} style={{ ...columnStyle, flex: 1 }}>
                      保温袋:
                      <span style={totalTextStyle}>{orders.realInsulatedBagCount}</span>
                    </Col>
                  </Tooltip>
                );
              case '11':
                return (
                  <Tooltip title={orders.realFreshContainerCount}>
                    <Col span={4} style={{ ...columnStyle, flex: 1 }}>
                      鲜食筐:
                      <span style={totalTextStyle}>{orders.realFreshContainerCount}</span>
                    </Col>
                  </Tooltip>
                );
              default:
                return '';
            }
          })}
        </Row>
      </div>
    );
  };

  /** 计算汇总 */
  collectByOrder = data => {
    data = data.filter(x => x.orderType !== 'OnlyBill');
    if (data.length === 0) {
      return {
        realCartonCount: 0,
        realScatteredCount: 0,
        realContainerCount: 0,
        realColdContainerCount: 0,
        realFreezeContainerCount: 0,
        realFreshContainerCount: 0,
        realInsulatedBagCount: 0,
        realInsulatedContainerCount: 0,
        volume: 0,
        weight: 0,
        totalStores: 0,
      };
    }
    let totalStores = [];
    data = data.map(x => {
      if (x.orderNumber) {
        x.stillCartonCount = x.cartonCount;
        x.stillScatteredCount = x.scatteredCount;
        x.stillContainerCount = x.containerCount;

        x.stillColdContainerCount = x.coldContainerCount;
        x.stillFreezeContainerCount = x.freezeContainerCount;
        x.stillFreshContainerCount = x.freshContainerCount;
        x.stillInsulatedBagCount = x.insulatedBagCount;
        x.stillInsulatedContainerCount = x.insulatedContainerCount;
      }
      if (totalStores.indexOf(x.deliveryPoint.code) === -1) {
        totalStores.push(x.deliveryPoint.code);
      }
      return x;
    });
    return {
      realCartonCount: Math.round(sumBy(data.map(x => x.stillCartonCount)) * 100) / 100,
      realScatteredCount: Math.round(sumBy(data.map(x => x.stillScatteredCount)) * 100) / 100,
      realContainerCount: Math.round(sumBy(data.map(x => x.stillContainerCount)) * 100) / 100,
      realColdContainerCount: Math.round(sumBy(data.map(x => x.coldContainerCount))),

      realFreezeContainerCount:
        Math.round(sumBy(data.map(x => x.freezeContainerCount)) * 100) / 100,
      realFreshContainerCount: Math.round(sumBy(data.map(x => x.freshContainerCount)) * 100) / 100,
      realInsulatedBagCount: Math.round(sumBy(data.map(x => x.insulatedBagCount)) * 100) / 100,
      realInsulatedContainerCount:
        Math.round(sumBy(data.map(x => x.insulatedContainerCount)) * 100) / 100,

      weight: Math.round(sumBy(data.map(x => Number(x.weight)))) / 1000,
      volume: Math.round(sumBy(data.map(x => Number(x.volume))) * 100) / 100,
      totalStores: totalStores.length,
    };
  };

  render () {
    const {
      searchKey,
      loading,
      searchPagination,
      auditedData,
      auditedCollectData,
      auditedParentRowKeys,
      auditedRowKeys,
      waveOrder,
      isOrderCollect,
      dispatchConfig,
    } = this.state;

    const collectOrder = this.collectByOrder(this.state.selectOrders);
    const splitSta = dispatchConfig?.orderPoolStatistics?.split(',');
    const orderPoolHeight = dispatchConfig?.isShowSum
      ? splitSta !== undefined && splitSta.length > 6 ? 290 : 235 : 210;

    return (
      <>
        {/* 查询表单 */}
        <SearchForm
          refresh={this.refreshOrderPool}
          key={`${searchKey}1`}
          quickuuid="sj_itms_dispatching_orderpool"
          dispatchcenterSearch
          refreshOrderPool={this.refreshOrderPool}
        />

        <div>
          {/* 待排订单列表 */}
          {isOrderCollect ? (
            <DispatchingChildTable
              comId={this.state.comId}
              clickRow
              childSettingCol
              pagination={searchPagination || false}
              loading={loading}
              dataSource={auditedCollectData}
              refreshDataSource={(_, pages, sorter) => {
                this.refreshOrderPool(undefined, pages, sorter);
              }}
              changeSelectRows={this.childTableChangeRows}
              selectedRowKeys={auditedParentRowKeys}
              childSelectedRowKeys={auditedRowKeys}
              columns={OrderCollectColumns}
              nestColumns={OrderDetailColumns}
              scrollY={`calc(80vh - ${orderPoolHeight}px)`}
              title={() => this.drawCollect(false, collectOrder)}
              footer={() => this.drawCollect(true, waveOrder)}
            />
          ) : (
            <DispatchingTable
              comId={this.state.comId}
              clickRow
              pagination={searchPagination || false}
              loading={loading}
              dataSource={auditedData}
              refreshDataSource={(_, pages, sorter) => {
                this.refreshOrderPool(undefined, pages, sorter);
              }}
              changeSelectRows={selectedRowKeys => this.tableChangeRows(selectedRowKeys)}
              selectedRowKeys={auditedRowKeys}
              columns={OrderColumns}
              scrollY={`calc(80vh - ${orderPoolHeight}px)`}
              title={() => this.drawCollect(false, collectOrder)}
              footer={() => this.drawCollect(true, waveOrder)}
            />
          )}
        </div>
      </>
    );
  }
}
