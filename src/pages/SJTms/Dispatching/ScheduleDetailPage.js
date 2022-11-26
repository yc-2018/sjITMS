/*
 * @Author: guankongjin
 * @Date: 2022-05-12 16:10:30
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-11-26 09:07:28
 * @Description: 待定订单
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\ScheduleDetailPage.js
 */
import React, { Component } from 'react';
import { Button, Row, Col, Typography, message, Empty } from 'antd';
import emptySvg from '@/assets/common/img_empoty.svg';
import { ScheduleDetailColumns, ScheduleDetailCollectColumns } from './DispatchingColumns';
import EditContainerNumberPage from './EditContainerNumberPage';
import DispatchingTable from './DispatchingTable';
import DispatchingChildTable from './DispatchingChildTable';
import dispatchingStyles from './Dispatching.less';
import { removeOrders } from '@/services/sjitms/ScheduleBill';
import { getDetailByBillUuids } from '@/services/sjitms/ScheduleBill';
import { groupBy, sumBy } from 'lodash';

const { Text } = Typography;

export default class ScheduleDetailPage extends Component {
  state = {
    loading: false,
    selectedRowKeys: [],
    selectedParentRowKeys: [],
    schedule: undefined,
    scheduleDetail: [],
    scheduleCollectDetail: [],
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOrderCollect != this.props.isOrderCollect) {
      this.setState({
        selectedRowKeys: [],
        selectedParentRowKeys: [],
        scheduleDetail: [],
        scheduleCollectDetail: [],
      });
    }
  }

  refreshTable = async schedule => {
    this.setState({ loading: true });
    let details = [];
    if (schedule) {
      const response = await getDetailByBillUuids([schedule.uuid]);
      details = response.success && response.data ? response.data : [];
    }
    this.setState({
      schedule,
      scheduleDetail: details,
      scheduleCollectDetail: details.length > 0 ? this.groupData(details) : [],
      selectedRowKeys: [],
      childSelectedRowKeys: [],
      loading: false,
    });
    this.props.refreshSelectRowOrder([], ['Schedule']);
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
        warning: orders.some(x => x.warning),
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

  //排车单明细整件数量修改
  editDetail = record => {
    const { schedule } = this.state;
    record.billNumber = schedule.billNumber;
    this.editPageModalRef.show(record);
  };

  //删除明细
  handleRemoveDetail = () => {
    const { selectedRowKeys, schedule, scheduleDetail } = this.state;
    if (selectedRowKeys.length == 0 || selectedRowKeys == undefined) {
      message.warning('请选择订单明细！');
      return;
    }
    const orderUuids = scheduleDetail
      .filter(x => selectedRowKeys.indexOf(x.uuid) != -1)
      .map(x => x.orderUuid);
    removeOrders({ billUuid: schedule.uuid, orderUuids }).then(response => {
      if (response.success) {
        message.success('保存成功！');
        this.refreshTable();
        this.props.refreshPending();
        this.props.refreshSchedule();
      }
    });
  };

  //更新选中行
  tableChangeRows = selectedRowKeys => {
    const { scheduleDetail } = this.state;
    if (!scheduleDetail) return;
    let orders = scheduleDetail;
    orders = orders.map(item => {
      return { ...item, billNumber: item.orderNumber, stat: 'Schedule' };
    });
    this.props.refreshSelectRowOrder(orders.filter(x => selectedRowKeys.indexOf(x.uuid) != -1), [
      'Schedule',
    ]);
    this.setState({ selectedRowKeys });
  };
  childTableChangeRows = result => {
    const { scheduleDetail } = this.state;
    if (!scheduleDetail) return;
    let orders = scheduleDetail;
    orders = orders?.map(item => {
      return { ...item, billNumber: item.orderNumber, stat: 'Schedule' };
    });
    this.props.refreshSelectRowOrder(
      orders.filter(x => result.childSelectedRowKeys.indexOf(x.uuid) != -1),
      ['Schedule']
    );
    this.setState({
      selectedParentRowKeys: result.selectedRowKeys,
      selectedRowKeys: result.childSelectedRowKeys,
    });
  };

  render() {
    const {
      loading,
      selectedRowKeys,
      selectedParentRowKeys,
      schedule,
      scheduleDetail,
      scheduleCollectDetail,
    } = this.state;
    return schedule == undefined ? (
      <Empty style={{ marginTop: 80 }} image={emptySvg} description="暂无数据，请选择排车单！" />
    ) : (
      <div style={{ padding: 5 }}>
        <Row style={{ marginBottom: 5, lineHeight: '28px' }}>
          <Col span={12}>
            <Text className={dispatchingStyles.cardTitle}>排车单： {schedule.BILLNUMBER}</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            {schedule.STAT == 'Saved' ? (
              <Button style={{ marginRight: 30 }} onClick={() => this.handleRemoveDetail()}>
                移除
              </Button>
            ) : (
              <></>
            )}
          </Col>
        </Row>
        {this.props.isOrderCollect ? (
          <DispatchingChildTable
            comId="collectScheduleDetail"
            clickRow
            // childSettingCol
            pagination={false}
            loading={loading}
            dataSource={scheduleCollectDetail}
            refreshDataSource={scheduleCollectDetail => {
              this.childTableChangeRows({ selectedRowKeys: [], childSelectedRowKeys: [] });
              this.setState({ scheduleCollectDetail });
            }}
            changeSelectRows={this.childTableChangeRows}
            selectedRowKeys={selectedParentRowKeys}
            childSelectedRowKeys={selectedRowKeys}
            columns={ScheduleDetailCollectColumns}
            nestColumns={ScheduleDetailColumns}
            scrollY="calc(60vh - 80px)"
          />
        ) : (
          <DispatchingTable
            comId="scheduleDetail"
            clickRow
            pagination={false}
            loading={loading}
            dataSource={scheduleDetail}
            refreshDataSource={scheduleDetail => {
              this.tableChangeRows([]);
              this.setState({ scheduleDetail });
            }}
            changeSelectRows={this.tableChangeRows}
            selectedRowKeys={selectedRowKeys}
            columns={ScheduleDetailColumns}
            scrollY="calc(60vh - 80px)"
          />
        )}
        {/* 修改排车数量  */}
        <EditContainerNumberPage
          modal={{ title: '编辑' }}
          refresh={() => {
            this.props.refreshSchedule;
          }}
          onRef={node => (this.editPageModalRef = node)}
        />
      </div>
    );
  }
}
