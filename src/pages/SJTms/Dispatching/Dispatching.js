/*
 * @Author: guankongjin
 * @Date: 2022-03-29 14:03:19
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-01-05 09:29:41
 * @Description: 配送调度主页面
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\Dispatching.js
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Layout, Row, Col } from 'antd';
import Page from '@/pages/Component/RapidDevelopment/CommonLayout/Page/Page';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import OrderPoolPage from './OrderPoolPage';
import SchedulePage from './SchedulePage';
import PendingPage from './PendingPage';
import ScheduleDetailPage from './ScheduleDetailPage';
import dispatchingStyles from './Dispatching.less';
import { loginOrg } from '@/utils/LoginContext';
import { getDispatchConfig } from '@/services/tms/DispatcherConfig';

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
    dispatchConfig: {},
    isOrderCollect: true,
  };

  async componentDidMount() {
    const response = await getDispatchConfig(loginOrg().uuid);
    if (response.success) {
      this.setState({ dispatchConfig: response.data });
    }
    const isOrderCollect = localStorage.getItem(window.location.hostname + '-orderCollect');
    this.setState({ isOrderCollect: isOrderCollect != 'false' });
  }

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
    let tempSelectOrders = selectOrders.filter(x => stat.indexOf(x.stat) == -1);
    this.setState({ selectOrders: [...tempSelectOrders, ...orders] });
  };
  refreshOrderCollect = isOrderCollect => {
    localStorage.setItem(window.location.hostname + '-orderCollect', isOrderCollect);
    this.setState({ isOrderCollect, selectOrders: [] });
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
                <Row gutter={[5, 5]}>
                  <Col span={12}>
                    <div className={dispatchingStyles.dispatchingCard}>
                      <OrderPoolPage
                        scheduleRowKeys={this.getScheduleRowKeys}
                        ref={ref => (this.orderPoolPageRef = ref)}
                        isOrderCollect={this.state.isOrderCollect}
                        refreshOrderCollect={this.refreshOrderCollect}
                        refreshSchedule={this.refreshScheduleTable}
                        refreshPending={this.refreshPendingTable}
                        selectPending={this.getSelectPending}
                        dispatchConfig={this.state.dispatchConfig}
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
                        dispatchConfig={this.state.dispatchConfig}
                        authority={this.props.route?.authority ? this.props.route.authority : null}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={dispatchingStyles.dispatchingBottomCard}>
                      <PendingPage
                        scheduleRowKeys={this.getScheduleRowKeys}
                        isOrderCollect={this.state.isOrderCollect}
                        ref={ref => (this.pendingPageRef = ref)}
                        refreshOrder={this.refreshOrderTable}
                        refreshSchedule={this.refreshScheduleTable}
                        refreshSelectRowOrder={this.refreshSelectRowOrder}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={dispatchingStyles.dispatchingBottomCard}>
                      <ScheduleDetailPage
                        ref={ref => (this.scheduleDetailPageRef = ref)}
                        isOrderCollect={this.state.isOrderCollect}
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
