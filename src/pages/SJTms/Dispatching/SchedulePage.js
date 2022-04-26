/*
 * @Author: guankongjin
 * @Date: 2022-03-31 09:15:58
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-26 09:03:13
 * @Description: 排车单面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\SchedulePage.js
 */
import React, { PureComponent } from 'react';
import { Modal, Tabs, Button, message } from 'antd';
import CardTable from './CardTable';
import { ScheduleColumns, ScheduleDetailColumns } from './DispatchingColumns';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { queryData } from '@/services/quick/Quick';
import { getScheduleByStat, approve, cancelApprove, remove } from '@/services/sjitms/ScheduleBill';

const { TabPane } = Tabs;

export default class SchedulePage extends PureComponent {
  state = {
    loading: false,
    scheduleData: [],
    activeTab: 'Saved',
  };
  scheduleTable = React.createRef();
  scheduleApprovedTable = React.createRef();

  componentDidMount() {
    this.getSchedules(this.state.activeTab);
  }

  //获取排车单
  getSchedules = stat => {
    this.setState({ loading: true });
    getScheduleByStat(stat).then(response => {
      if (response.success) {
        this.setState({ loading: false, scheduleData: response.data, activeTab: stat });
      }
    });
  };
  //标签页切换
  handleTabChange = activeKey => {
    this.getSchedules(activeKey);
  };

  //取消批准
  handleCancelApprove = () => {
    const { scheduleData, activeTab } = this.state;
    const { selectedRowKeys } = this.scheduleApprovedTable.current.state;
    const schedule = scheduleData.find(x => x.uuid == selectedRowKeys[0]);
    cancelApprove(schedule.uuid, schedule.version).then(response => {
      if (response.success) {
        message.success('取消批准成功！');
        this.getSchedules(activeTab);
      }
    });
  };

  //批准
  handleApprove = () => {
    const { scheduleData, activeTab } = this.state;
    const { selectedRowKeys } = this.scheduleTable.current.state;
    const schedule = scheduleData.find(x => x.uuid == selectedRowKeys[0]);
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
        const { scheduleData, activeTab } = this.state;
        const { selectedRowKeys } = this.scheduleTable.current.state;
        const schedule = scheduleData.find(x => x.uuid == selectedRowKeys[0]);
        remove(schedule.uuid).then(response => {
          if (response.success) {
            message.success('删除成功！');
            this.getSchedules(activeTab);
          }
        });
      },
    });
  };

  render() {
    const { scheduleData, loading, activeTab } = this.state;
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
    const edit = {
      width: 40,
      render: val => <a href="#"> 编辑</a>,
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
            rowSelect
            ref={this.scheduleTable}
            dataSource={scheduleData}
            columns={[edit, ...ScheduleColumns]}
            nestColumns={ScheduleDetailColumns}
            childTable
            loading={loading}
          />
        </TabPane>
        <TabPane tab="已批准" key="Approved">
          <CardTable
            scrollY={540}
            rowSelect
            ref={this.scheduleApprovedTable}
            dataSource={scheduleData}
            columns={ScheduleColumns}
            nestColumns={ScheduleDetailColumns}
            childTable
            loading={loading}
          />
        </TabPane>
        <TabPane tab="已作废" key="Aborted">
          <CardTable
            scrollY={540}
            rowSelect
            dataSource={scheduleData}
            columns={ScheduleColumns}
            loading={loading}
          />
        </TabPane>
      </Tabs>
    );
  }
}
