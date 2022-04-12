/*
 * @Author: guankongjin
 * @Date: 2022-03-31 09:15:58
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-01 15:32:45
 * @Description: 排车单面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\SchedulePage.js
 */
import React, { PureComponent } from 'react';
import { Tabs, Button } from 'antd';
import CardTable from './CardTable';

const { TabPane } = Tabs;

export default class SchedulePage extends PureComponent {
  state = {
    column: [],
    data: [],
  };
  render() {
    const operations = (
      <div>
        <Button type={'primary'}>批准</Button>
        <Button style={{ marginLeft: 10 }}>作废</Button>
      </div>
    );
    return (
      <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
        <TabPane tab="排车单" key="1">
          {/* <div>
            <Button type={'primary'}>高级查询</Button>
          </div> */}
          <CardTable scrollY={540} quickuuid="sj_itms_schedule" />
        </TabPane>
        <TabPane tab="已批准" key="2">
          <CardTable scrollY={540} quickuuid="sj_itms_schedule" />
        </TabPane>
        <TabPane tab="已作废" key="3">
          <CardTable scrollY={540} quickuuid="sj_itms_schedule" />
        </TabPane>
      </Tabs>
    );
  }
}
