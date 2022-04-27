/*
 * @Author: guankongjin
 * @Date: 2022-03-31 09:15:58
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-27 15:43:24
 * @Description: 排车单面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\SchedulePage.js
 */
import React, { PureComponent } from 'react';
import { Modal, Tabs, Button, Tooltip, message } from 'antd';
import CardTable from './CardTable';
import EditContainerNumberPage from './EditContainerNumberPage';
import { ScheduleColumns, ScheduleDetailColumns } from './DispatchingColumns';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { getScheduleByStat, approve, cancelApprove, remove } from '@/services/sjitms/ScheduleBill';

const { TabPane } = Tabs;

export default class SchedulePage extends PureComponent {
  state = {
    loading: false,
    savedRowKeys: [],
    savedChildRowKeys: [],
    approvedRowKeys: [],
    abortedRowKeys: [],
    scheduleData: [],
    activeTab: 'Saved',
    editPageVisible: false,
    scheduleDetail: {},
  };

  componentDidMount() {
    this.getSchedules(this.state.activeTab);
  }

  //获取排车单
  getSchedules = stat => {
    this.setState({ loading: true });
    getScheduleByStat(stat).then(response => {
      if (response.success) {
        this.setState({
          loading: false,
          scheduleData: response.data,
          activeTab: stat,
          savedRowKeys: [],
          savedChildRowKeys: [],
          approvedRowKeys: [],
          abortedRowKeys: [],
        });
      }
    });
  };
  //标签页切换
  handleTabChange = activeKey => {
    this.getSchedules(activeKey);
  };

  //排车单编辑/排车单明细整件数量修改
  editTable = record => {
    return () => {
      const { scheduleData } = this.state;
      if (record.sourceNum) {
        record.billNumber = scheduleData.find(x => x.uuid == record.billUuid).billNumber;
        this.setState({ editPageVisible: true, scheduleDetail: record });
      }
    };
  };
  handleShowEditPage = () => {
    this.editContainerNumberPageModalRef.show();
  };

  //取消批准
  handleCancelApprove = () => {
    const { scheduleData, activeTab, approvedRowKeys } = this.state;
    const schedule = scheduleData.find(x => x.uuid == approvedRowKeys[0]);
    cancelApprove(schedule.uuid, schedule.version).then(response => {
      if (response.success) {
        message.success('取消批准成功！');
        this.getSchedules(activeTab);
      }
    });
  };

  //批准
  handleApprove = () => {
    const { scheduleData, activeTab, savedRowKeys } = this.state;
    const schedule = scheduleData.find(x => x.uuid == savedRowKeys[0]);
    approve(schedule.uuid, schedule.version).then(response => {
      if (response.success) {
        message.success('批准成功！');
        this.getSchedules(activeTab);
      }
    });
  };

  //删除
  handleDelete = () => {
    Modal.confirm({
      title: '是否确认删除排车单？',
      onOk: async () => {
        const { activeTab, savedRowKeys } = this.state;
        remove(savedRowKeys[0]).then(response => {
          if (response.success) {
            message.success('删除成功！');
            this.getSchedules(activeTab);
          }
        });
      },
    });
  };

  //表格行选择
  tableChangeRows = tableType => {
    return event => {
      switch (tableType) {
        case 'Approved':
          this.setState({ approvedRowKeys: event.selectedRowKeys });
          break;
        case 'Aborted':
          this.setState({ abortedRowKeys: event.selectedRowKeys });
          break;
        default:
          this.setState({
            savedRowKeys: event.selectedRowKeys,
            savedChildRowKeys: event.childSelectedRowKeys,
          });
          break;
      }
    };
  };

  render() {
    const {
      scheduleData,
      loading,
      savedRowKeys,
      savedChildRowKeys,
      approvedRowKeys,
      abortedRowKeys,
      activeTab,
      editPageVisible,
      scheduleDetail,
    } = this.state;

    const buildOperations = () => {
      switch (activeTab) {
        case 'Approved':
          return (
            <Button style={{ marginLeft: 10 }} onClick={this.handleCancelApprove}>
              取消批准
            </Button>
          );
        case 'Aborted':
          return <Button style={{ marginLeft: 10 }}>取消作废</Button>;
        default:
          return (
            <div>
              <Button type={'primary'} onClick={this.handleApprove}>
                批准
              </Button>
              <Button style={{ marginLeft: 10 }} onClick={this.handleDelete}>
                删除
              </Button>
            </div>
          );
      }
    };
    const editColumn = {
      render: (val, record) => (
        <Tooltip placement="topLeft" title={val}>
          <a href="#" onClick={this.editTable(record)}>
            {val}
          </a>
        </Tooltip>
      ),
    };
    const billNumberColumn = {
      title: '单号',
      dataIndex: 'billNumber',
      width: 150,
    };
    const orderNumberColumn = {
      title: '订单号',
      dataIndex: 'orderNumber',
      width: 180,
    };

    return (
      <Tabs
        activeKey={activeTab}
        onChange={this.handleTabChange}
        tabBarExtraContent={buildOperations()}
      >
        <TabPane tab="排车单" key="Saved">
          <CardTable
            scrollY={540}
            selectedRowKeys={savedRowKeys}
            childSelectedRowKeys={savedChildRowKeys}
            changeSelectRows={this.tableChangeRows()}
            dataSource={scheduleData}
            columns={[{ ...billNumberColumn, ...editColumn }, ...ScheduleColumns]}
            nestColumns={[{ ...orderNumberColumn, ...editColumn }, ...ScheduleDetailColumns]}
            hasChildTable
            loading={loading}
          />
          <EditContainerNumberPage
            modal={{ title: '修改排车数量' }}
            refresh={this.refreshOrderPool}
            visible={editPageVisible}
            scheduleDetail={scheduleDetail}
            onCancel={() => this.setState({ editPageVisible: false })}
          />
        </TabPane>
        <TabPane tab="已批准" key="Approved">
          <CardTable
            scrollY={540}
            selectedRowKeys={approvedRowKeys}
            changeSelectRows={this.tableChangeRows('Approved')}
            clickRow
            dataSource={scheduleData}
            columns={[billNumberColumn, ...ScheduleColumns]}
            nestColumns={[orderNumberColumn, ...ScheduleDetailColumns]}
            hasChildTable
            loading={loading}
          />
        </TabPane>
        <TabPane tab="已作废" key="Aborted">
          <CardTable
            scrollY={540}
            selectedRowKeys={abortedRowKeys}
            changeSelectRows={this.tableChangeRows('Aborted')}
            clickRow
            dataSource={scheduleData}
            columns={[billNumberColumn, ...ScheduleColumns]}
            nestColumns={[orderNumberColumn, ...ScheduleDetailColumns]}
            hasChildTable
            loading={loading}
          />
        </TabPane>
      </Tabs>
    );
  }
}
