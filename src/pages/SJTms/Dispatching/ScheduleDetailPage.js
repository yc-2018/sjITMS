/*
 * @Author: guankongjin
 * @Date: 2022-05-12 16:10:30
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-14 17:57:46
 * @Description: 待定订单
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\ScheduleDetailPage.js
 */
import React, { Component } from 'react';
import { Table, Button, Row, Col, Typography, message, Empty } from 'antd';
import { ScheduleDetailColumns } from './DispatchingColumns';
import EditContainerNumberPage from './EditContainerNumberPage';
import DispatchingTable from './DispatchingTable';
import dispatchingStyles from './Dispatching.less';
import { addOrders } from '@/services/sjitms/ScheduleBill';

const { Title, Text } = Typography;

export default class ScheduleDetailPage extends Component {
  state = {
    loading: false,
    selectRowKeys: [],
    schedule: undefined,
  };

  refreshTable = schedule => {
    this.setState({ schedule });
  };

  //排车单明细整件数量修改
  editTable = record => {
    return () => {
      const { schedule } = this.state;
      record.billNumber = schedule.billNumber;
      this.editPageModalRef.show(record);
    };
  };

  //删除明细
  handleRemoveDetail = () => {};

  tableChangeRows = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  render() {
    const { loading, selectRowKeys, schedule } = this.state;
    const editColumn = {
      title: '操作',
      width: 50,
      render: (_, record) => (
        <a href="#" onClick={this.editTable(record)}>
          编辑
        </a>
      ),
    };
    return schedule == undefined ? (
      <Empty style={{ marginTop: 80 }} description="暂无数据，请选择排车单！" />
    ) : (
      <div style={{ padding: 5 }}>
        <Row style={{ marginBottom: 5, lineHeight: '28px' }}>
          <Col span={12}>
            <Text className={dispatchingStyles.cardTitle}>排车单： {schedule.billNumber}</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button style={{ marginLeft: 10 }} onClick={() => this.handleRemoveDetail()}>
              移除
            </Button>
          </Col>
        </Row>
        <DispatchingTable
          onClickRow={false}
          loading={loading}
          dataSource={schedule.details}
          changeSelectRows={this.tableChangeRows}
          selectedRowKeys={selectRowKeys}
          columns={[editColumn, ...ScheduleDetailColumns]}
          scrollY="calc(68vh - 120px)"
        />
        {/* 修改排车数量  */}
        <EditContainerNumberPage
          modal={{ title: '编辑' }}
          refresh={this.props.refresh}
          onRef={node => (this.editPageModalRef = node)}
        />
      </div>
    );
  }
}
