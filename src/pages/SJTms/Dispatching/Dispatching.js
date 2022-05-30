/*
 * @Author: guankongjin
 * @Date: 2022-03-29 14:03:19
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-28 12:05:16
 * @Description: 配送调度主页面
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\Dispatching.js
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Layout, Row, Col } from 'antd';
import FullScreenButton from '@/pages/Component/Page/FullScreenButton';
import Page from '@/pages/Component/RapidDevelopment/CommonLayout/Page/Page';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import OrderPoolPage from './OrderPoolPage';
import SchedulePage from './SchedulePage';
import PendingPage from './PendingPage';
import ScheduleDetailPage from './ScheduleDetailPage';
import dispatchingStyles from './Dispatching.less';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

const { Content } = Layout;

@connect(({ dispatching, loading }) => ({
  dispatching,
  loading: loading.models.dispatching,
}))
export default class Dispatching extends Component {
  orderPoolPageRef = React.createRef();
  schedulePageRef = React.createRef();
  pendingPageRef = React.createRef();

  state = {
    selectOrders: [],
  };

  refreshOrderTable = () => {
    this.orderPoolPageRef.refreshTable();
  };
  refreshScheduleTable = () => {
    this.schedulePageRef.refreshTable();
  };
  refreshPendingTable = () => {
    this.pendingPageRef.refreshTable();
  };
  refreshSelectScheduleTable = schedule => {
    return this.scheduleDetailPageRef.refreshTable(schedule);
  };

  getScheduleRowKeys = () => {
    return this.schedulePageRef.state.savedRowKeys;
  };

  //获取选中待定订单
  getSelectPending = () => {
    const pendingData = this.pendingPageRef.state.pendingData;
    const pendingRowKeys = this.pendingPageRef.state.pendingRowKeys;
    return pendingData ? pendingData.filter(x => pendingRowKeys.indexOf(x.uuid) != -1) : [];
  };

  //保存选中订单，用于选中订单汇总
  refreshSelectRowOrder = (orders, stat) => {
    const { selectOrders } = this.state;
    let tempSelectOrders =
      stat == 'Pending'
        ? selectOrders.filter(x => x.pendingTag != stat)
        : selectOrders.filter(x => x.stat != stat);
    this.setState({ selectOrders: [...tempSelectOrders, ...orders] });
  };

  render() {
    if (this.props.dispatching.showPage === 'query') {
      return (
        <PageHeaderWrapper>
          <Page
            withCollect={true}
            pathname={this.props.location ? this.props.location.pathname : ''}
          >
            <Content className={dispatchingStyles.dispatchingContent}>
              <Layout className={dispatchingStyles.dispatchingLayout}>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <div className={dispatchingStyles.dispatchingCard}>
                      <OrderPoolPage
                        scheduleRowKeys={this.getScheduleRowKeys}
                        ref={ref => (this.orderPoolPageRef = ref)}
                        refreshSchedule={this.refreshScheduleTable}
                        refreshPending={this.refreshPendingTable}
                        selectPending={this.getSelectPending}
                        refreshSelectRowOrder={this.refreshSelectRowOrder}
                        totalOrder={this.state.selectOrders}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={dispatchingStyles.dispatchingCard}>
                      <SchedulePage
                        ref={ref => (this.schedulePageRef = ref)}
                        refreshOrder={this.refreshOrderTable}
                        refreshPending={this.refreshPendingTable}
                        refreshDetail={this.refreshSelectScheduleTable}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={dispatchingStyles.dispatchingCard}>
                      <PendingPage
                        scheduleRowKeys={this.getScheduleRowKeys}
                        ref={ref => (this.pendingPageRef = ref)}
                        refreshOrder={this.refreshOrderTable}
                        refreshSchedule={this.refreshScheduleTable}
                        refreshSelectRowOrder={this.refreshSelectRowOrder}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={dispatchingStyles.dispatchingCard}>
                      <ScheduleDetailPage
                        ref={ref => (this.scheduleDetailPageRef = ref)}
                        refreshSchedule={this.refreshScheduleTable}
                        refreshPending={this.refreshPendingTable}
                        refreshSelectRowOrder={this.refreshSelectRowOrder}
                      />
                    </div>
                  </Col>
                </Row>
              </Layout>
            </Content>
          </Page>
        </PageHeaderWrapper>
      );
    }
  }
}
