/*
 * @Author: guankongjin
 * @Date: 2022-03-31 09:15:58
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-20 15:08:57
 * @Description: 排车单面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\SchedulePage.js
 */
import React, { PureComponent } from 'react';
import { Tabs, Button, message } from 'antd';
import CardTable from './CardTable';
import { ScheduleColumns } from './DispatchingColumns';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { queryData } from '@/services/quick/Quick';
import { approve, remove } from '@/services/sjitms/ScheduleBill';

const { TabPane } = Tabs;

export default class SchedulePage extends PureComponent {
  state = {
    loading: false,
    scheduleData: [],
    activeTab: 'Saved',
  };
  scheduleTable = React.createRef();

  componentDidMount() {
    this.getSchedules(this.state.activeTab);
  }

  //获取排车单
  getSchedules = stat => {
    this.setState({ loading: true });
    const queryParams = [
      { field: 'dispatchCenterUuid', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
      { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
      { field: 'STAT', type: 'VarChar', rule: 'eq', val: stat },
    ];
    queryData({ quickuuid: 'sj_itms_schedule', superQuery: { queryParams } }).then(response => {
      if (response.success) {
        this.setState({ loading: false, scheduleData: response.data.records, activeTab: stat });
      }
    });
  };
  //标签页切换
  handleTabChange = activeKey => {
    this.getSchedules(activeKey);
  };

  //批准
  handleApprove = () => {
    const { scheduleData, activeTab } = this.state;
    const { selectedRowKeys } = this.scheduleTable.current.state;
    const schedule = scheduleData.find(x => x.UUID == selectedRowKeys[0]);
    approve(schedule.UUID, schedule.FVERSION).then(response => {
      if (response.success) {
        message.success('批准成功！');
        this.getSchedules(activeTab);
      }
    });
  };
  //删除
  handleDelete = () => {
    const { scheduleData, activeTab } = this.state;
    const { selectedRowKeys } = this.scheduleTable.current.state;
    const schedule = scheduleData.find(x => x.UUID == selectedRowKeys[0]);
    remove(schedule.UUID).then(response => {
      if (response.success) {
        message.success('删除成功！');
        this.getSchedules(activeTab);
      }
    });
  };

  render() {
    const { scheduleData, loading, activeTab } = this.state;
    const buildOperations = () => {
      switch (activeTab) {
        case 'Approved':
          return <Button style={{ marginLeft: 10 }}>取消批准</Button>;
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
            columns={ScheduleColumns}
            loading={loading}
          />
        </TabPane>
        <TabPane tab="已批准" key="Approved">
          <CardTable
            scrollY={540}
            rowSelect
            loading={loading}
            dataSource={scheduleData}
            columns={ScheduleColumns}
          />
        </TabPane>
        <TabPane tab="已作废" key="Aborted">
          <CardTable
            scrollY={540}
            rowSelect
            loading={loading}
            dataSource={scheduleData}
            columns={ScheduleColumns}
          />
        </TabPane>
      </Tabs>
    );
  }
}
