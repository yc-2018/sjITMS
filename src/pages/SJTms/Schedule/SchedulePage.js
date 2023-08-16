/*
 * @Author: guankongjin
 * @Date: 2022-06-29 16:01:35
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-08-09 16:38:22
 * @Description: 排车单
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\SchedulePage.js
 */
import React, { PureComponent } from 'react';
import { Tabs, Layout, Empty } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/RapidDevelopment/CommonLayout/Page/Page';
import ScheduleSearchPage from './ScheduleSearchPage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import ScheduleCreatePage from './ScheduleCreatePage';
import RemoveCarCreatePage from './RemoveCarCreatePage';
import ScheduleDetailSearchPage from './ScheduleDetailSearchPage';
import ScheduleDeliveryPage from './ScheduleDeliveryPage';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import emptySvg from '@/assets/common/img_empoty.svg';
import { getByDispatchcenterUuid } from '@/services/sjtms/DispatcherConfig';
import { loginOrg } from '@/utils/LoginContext';
const { Content } = Layout;
const TabPane = Tabs.TabPane;

export default class SchedulePage extends PureComponent {
  state = {
    selectedRows: {},
    params: { title: '' },
    comKey: 'scheduleSearchPage',
    isShowDetail: false,
    planConfig: {},
  };
  //刷新
  refreshSelectedRow = row => {
    const { selectedRows } = this.state;
    if (selectedRows.UUID != row.UUID) this.setState({ selectedRows: row, isShowDetail: true });
  };

  componentDidMount() {
    getByDispatchcenterUuid(loginOrg().uuid).then(e => {
      if (e.success) {
        this.setState({ planConfig: e.data });
      }
    });
  }
  //修改人员
  memberModalClick = record => {
    this.setState({
      params: { entityUuid: record.UUID, title: record.BILLNUMBER },
    });
    this.createPageModalRef.show();
  };
  //移车
  removeCarModalClick = selectedRows => {
    this.setState({
      params: { entityUuid: selectedRows[0].UUID, title: selectedRows[0].BILLNUMBER },
    });
    this.RemoveCarModalRef.show();
  };
  refreshSelecteds = () => {
    this.createPageModalRef.hide();
  };
  render() {
    const { isShowDetail, comKey, selectedRows, params, planConfig } = this.state;
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          <Content style={{ padding: '0 10px' }}>
            <ScheduleSearchPage
              selectedRows={selectedRows}
              quickuuid="sj_itms_schedule"
              comKey={comKey}
              refreshSelectedRow={this.refreshSelectedRow}
              memberModalClick={this.memberModalClick}
              removeCarModalClick={this.removeCarModalClick}
              authority={this.props.route?.authority ? this.props.route.authority : null}
            />
            <div style={{ minHeight: 600 }}>
              {!isShowDetail ? (
                <Empty image={emptySvg} description={<span>暂无数据,请先选择排车单</span>} />
              ) : (
                <Tabs defaultActiveKey="detail" onChange={this.changeTabs}>
                  <TabPane tab="订单明细" key="detail">
                    <ScheduleDetailSearchPage
                      quickuuid="sj_itms_schedule_order"
                      authority={this.props.route?.authority ? this.props.route.authority : null}
                      selectedRows={selectedRows.UUID}
                    />
                  </TabPane>
                  <TabPane tab="配送进度" key="delivery">
                    <ScheduleDeliveryPage
                      quickuuid="sj_itms_schedule_delivery"
                      authority={this.props.route?.authority ? this.props.route.authority : null}
                      selectedRows={selectedRows.UUID}
                    />
                  </TabPane>
                  <TabPane tab="操作日志" key="log">
                    <EntityLogTab entityUuid={selectedRows.UUID} />
                  </TabPane>
                </Tabs>
              )}
            </div>
            <CreatePageModal
              modal={{
                title: params.title,
                width: 1000,
                afterClose: () => {
                  this.setState({ comKey: Math.ceil(Math.random() * 1000) });
                },
              }}
              page={{
                quickuuid: 'sj_itms_schedule',
                params,
                extension: true,
                showPageNow: 'update',
                planConfig: planConfig,
                style: { color: 'black' },
              }}
              onSaved={this.refreshSelecteds}
              customPage={ScheduleCreatePage}
              onRef={node => (this.createPageModalRef = node)}
            />
            <CreatePageModal
              modal={{
                title: params.title,
                width: 1000,
                afterClose: () => {
                  this.setState({
                    comKey: Math.ceil(Math.random() * 1000),
                    isShowDetail: false,
                    selectedRows: [],
                  });
                },
              }}
              page={{ quickuuid: 'sj_itms_schedule_removecar', params }}
              customPage={RemoveCarCreatePage}
              onRef={node => (this.RemoveCarModalRef = node)}
            />
          </Content>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
