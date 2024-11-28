/*
 * @Author: guankongjin
 * @Date: 2022-03-29 14:03:19
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-04-04 16:36:07
 * @Description: 配送调度主页面
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\Dispatching.js
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Layout, Row, Col, Modal, Button } from 'antd';
import Page from '@/pages/Component/RapidDevelopment/CommonLayout/Page/Page';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import OrderPoolPage from './OrderPoolPage';
import SchedulePage from './SchedulePage';
import PendingPage from './PendingPage';
import ScheduleDetailPage from './ScheduleDetailPage';
import dispatchingStyles from './Dispatching.less';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { getDispatchConfig } from '@/services/sjtms/DispatcherConfig';
import { checkBaseData } from '@/services/sjitms/ScheduleBill';
import { dynamicQuery } from '@/services/quick/Quick';
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
    isOrderCollectType: 0,
    transferData : []
  };

  async componentDidMount() {
    const response = await getDispatchConfig(loginOrg().uuid);
    this.gettransferStation();
    if (response.success) {
      this.setState({
        dispatchConfig: response.data,
        isOrderCollect: response.data?.isSumOrder != 0,
        isOrderCollectType: response.data?.isSumOrder,
      });
    }
    const checkBase = await checkBaseData(loginCompany().uuid, loginOrg().uuid);
    if (checkBase && checkBase.success) {
      if (checkBase.data && checkBase.data?.length > 0) {
        Modal.confirm({
          title: (
            <span>
              门店代码:
              <p style={{ color: 'blue' }}>{checkBase.data.join(',')}</p>
              存在组队、到货类型、配送区域、高速线路区域补贴区域、信息为空
            </span>
          ),
        });
      }
    }
    // const isOrderCollect = localStorage.getItem(window.location.hostname + '-orderCollect');
    // this.setState({ isOrderCollect: isOrderCollect != 'false' });
    window.refreshDispatchAll = this.refreshDispatchAll;
    window.setTimeout(()=>{console.log("███████this.props>>>>🔴", this.props,"🔴<<<<██████")},3000)

  }

  /** 组件卸载前window.refreshDispatchAll设置回空 */
  componentWillUnmount () {
    window.refreshDispatchAll = null;
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

  /**
   * 刷新全部表格数据方法（提供window提供给智能调度）
   * @author ChenGuangLong
   * @since 2024/11/27 下午2:26
   */
  refreshDispatchAll = () => {
    this.refreshOrderTable();
    this.refreshScheduleTable();
    this.refreshPendingTable();
  };

  getScheduleRowKeys = () => {
    return this.schedulePageRef.state.savedRowKeys;
  };
  getSchedule = uuid => {
    const scheduleData = this.schedulePageRef.state.scheduleData;
    return scheduleData.find(x => x.uuid == uuid);
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

  handOnfush = () => {
    this.orderPoolPageRef.initialiPage();
    this.schedulePageRef.initialiPage();
  };
  // 获取转运站信息-赣州仓用
  gettransferStation = async () => {
    let param = {
      tableName: 'SJ_ITMS_TRANSFER_STATION',
      condition: {
        params: [
          { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
          { field: 'DISPATCHCENTERUUID', rule: 'like', val: [loginOrg().uuid] }
        ],
      },
    };
    let transferData = await dynamicQuery(param);
    if (transferData.success && transferData.result.records != 'false') {
      this.state.transferData = transferData.result.records;
    }
  }
  render() {
    if (this.props.dispatching.showPage === 'query') {
      return (
        <PageHeaderWrapper>
          <Page
            withCollect={true}
            pathname={this.props.location ? this.props.location.pathname : ''}
          >
            <Content className={dispatchingStyles.dispatchingContent}>
              <div
                style={{
                  position: 'absolute',
                  top: '1.35rem',
                  right: 360,
                  zIndex: 1,
                  width: 24,
                  height: 24,
                }}
              >
                <Button
                  onClick={() => this.handOnfush()}
                  style={{ background: '#516173', color: '#FFFFFF' }}
                >
                  重置
                </Button>
              </div>
              <Layout className={dispatchingStyles.dispatchingLayout}>
                <Row gutter={[5, 5]}>
                  <Col span={12}>
                    <div className={dispatchingStyles.dispatchingCard}>
                      <OrderPoolPage
                        scheduleRowKeys={this.getScheduleRowKeys}
                        getSchedule={this.getSchedule}
                        ref={ref => (this.orderPoolPageRef = ref)}
                        isOrderCollect={this.state.isOrderCollect}
                        isOrderCollectType={this.state.isOrderCollectType}
                        refreshOrderCollect={this.refreshOrderCollect}
                        refreshSchedule={this.refreshScheduleTable}
                        refreshPending={this.refreshPendingTable}
                        selectPending={this.getSelectPending}
                        dispatchConfig={this.state.dispatchConfig}
                        refreshSelectRowOrder={this.refreshSelectRowOrder}
                        totalOrder={this.state.selectOrders}
                        transferData={this.state.transferData}
                        go={(uri) => this.props.history.push(uri)}
                        authority={this.props.route?.authority ? this.props.route.authority : null}
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
                        transferData={this.state.transferData}
                        authority={this.props.route?.authority ? this.props.route.authority : null}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={dispatchingStyles.dispatchingBottomCard}>
                      <PendingPage
                        scheduleRowKeys={this.getScheduleRowKeys}
                        isOrderCollect={this.state.isOrderCollect}
                        isOrderCollectType={this.state.isOrderCollectType}
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
                        refreshSchedule={schedule =>
                          this.schedulePageRef.refreshScheduleTable(schedule)
                        }
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
