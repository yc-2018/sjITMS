/*
 * @Author: guankongjin
 * @Date: 2022-05-12 16:10:30
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-17 16:26:53
 * @Description: 待定订单
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\ScheduleDetailPage.js
 */
import React, { Component } from 'react';
import { Table, Button, Row, Col, Typography, message, Empty } from 'antd';
import emptySvg from '@/assets/common/img_empoty.svg';
import { ScheduleDetailColumns } from './DispatchingColumns';
import EditContainerNumberPage from './EditContainerNumberPage';
import DispatchingTable from './DispatchingTable';
import dispatchingStyles from './Dispatching.less';
import { removeOrders } from '@/services/sjitms/ScheduleBill';

const { Title, Text } = Typography;

export default class ScheduleDetailPage extends Component {
  state = {
    loading: false,
    selectedRowKeys: [],
    schedule: undefined,
  };

  refreshTable = schedule => {
    this.setState({ schedule });
  };

  //排车单明细整件数量修改
  editDetail = record => {
    const { schedule } = this.state;
    record.billNumber = schedule.billNumber;
    this.editPageModalRef.show(record);
  };

  //删除明细
  handleRemoveDetail = () => {
    const { selectedRowKeys, schedule } = this.state;
    if (selectedRowKeys.length == 0 || selectedRowKeys == undefined) {
      message.warning('请选择订单明细！');
      return;
    }
    const orderUuids = schedule.details
      .filter(x => selectedRowKeys.indexOf(x.uuid) != -1)
      .map(x => x.orderUuid);
    removeOrders({ billUuid: schedule.uuid, orderUuids }).then(response => {
      if (response.success) {
        message.success('保存成功！');
        this.refreshTable();
        this.props.refresh();
      }
    });
  };

  tableChangeRows = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  render() {
    const { loading, selectedRowKeys, schedule } = this.state;
    const editColumn = {
      title: '操作',
      width: 50,
      render: (_, record) => (
        <a href="#" onClick={() => this.editDetail(record)}>
          编辑
        </a>
      ),
    };
    let columns = ScheduleDetailColumns;
    if (schedule != undefined && schedule.stat == 'Saved') {
      columns = [editColumn, ...ScheduleDetailColumns];
    }
    return schedule == undefined ? (
      <Empty style={{ marginTop: 80 }} image={emptySvg} description="暂无数据，请选择排车单！" />
    ) : (
      <div style={{ padding: 5 }}>
        <Row style={{ marginBottom: 5, lineHeight: '28px' }}>
          <Col span={12}>
            <Text className={dispatchingStyles.cardTitle}>排车单： {schedule.billNumber}</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            {schedule.stat == 'Saved' ? (
              <Button style={{ marginLeft: 10 }} onClick={() => this.handleRemoveDetail()}>
                移除
              </Button>
            ) : (
              <></>
            )}
          </Col>
        </Row>
        <DispatchingTable
          onClickRow={false}
          pagination={false}
          loading={loading}
          dataSource={schedule.details}
          changeSelectRows={this.tableChangeRows}
          selectedRowKeys={selectedRowKeys}
          columns={columns}
          scrollY="calc(68vh - 75px)"
        />
        {/* 修改排车数量  */}
        <EditContainerNumberPage
          modal={{ title: '编辑' }}
          refresh={() => {
            this.props.refresh;
          }}
          onRef={node => (this.editPageModalRef = node)}
        />
      </div>
    );
  }
}
