/*
 * @Author: guankongjin
 * @Date: 2022-03-31 09:15:58
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-15 15:11:31
 * @Description: 排车单面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\SchedulePage.js
 */
import React, { PureComponent } from 'react';
import { Tabs, Button } from 'antd';
import CardTable from './CardTable';
import { ScheduleColumns } from './DispatchingColumns';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { queryData } from '@/services/quick/Quick';

const { TabPane } = Tabs;

export default class SchedulePage extends PureComponent {
  state = {
    loading: false,
    scheduleData: [],
  };

  componentDidMount() {
    this.getSchedules('Saved');
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
      this.setState({ loading: false, scheduleData: response.data.records });
    });
  };
  //标签页切换
  handleTabChange = activeKey => {
    this.getSchedules(activeKey);
  };

  render() {
    const { scheduleData, loading } = this.state;
    const operations = (
      <div>
        <Button type={'primary'}>批准</Button>
        <Button style={{ marginLeft: 10 }}>作废</Button>
      </div>
    );
    return (
      <Tabs
        defaultActiveKey="Saved"
        onChange={this.handleTabChange}
        tabBarExtraContent={operations}
      >
        <TabPane tab="排车单" key="Saved">
          <CardTable
            scrollY={540}
            rowSelect
            dataSource={scheduleData}
            columns={ScheduleColumns}
            loading={loading}
          />
        </TabPane>
        <TabPane tab="已批准" key="Approved">
          <CardTable
            scrollY={540}
            loading={loading}
            dataSource={scheduleData}
            columns={ScheduleColumns}
          />
        </TabPane>
        <TabPane tab="已作废" key="Aborted">
          <CardTable
            scrollY={540}
            loading={loading}
            dataSource={scheduleData}
            columns={ScheduleColumns}
          />
        </TabPane>
      </Tabs>
    );
  }
}
