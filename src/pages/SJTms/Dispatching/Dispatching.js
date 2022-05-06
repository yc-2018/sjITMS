/*
 * @Author: guankongjin
 * @Date: 2022-03-29 14:03:19
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-28 10:38:37
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

  refreshOrderTable = () => {
    this.orderPoolPageRef.refreshTable();
  };
  refreshScheduleTable = () => {
    this.schedulePageRef.refreshTable();
  };
  getScheduleRowKeys = () => {
    return this.schedulePageRef.state.savedRowKeys;
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
                        refresh={this.refreshScheduleTable}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={dispatchingStyles.dispatchingCard}>
                      <SchedulePage
                        ref={ref => (this.schedulePageRef = ref)}
                        refresh={this.refreshOrderTable}
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