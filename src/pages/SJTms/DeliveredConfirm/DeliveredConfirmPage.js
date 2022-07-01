import React, { Component, PureComponent } from 'react';
import { Form, message, Tabs, Layout, Row, Col, Button } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import SimpleQuery from '@/pages/Component/RapidDevelopment/OnlReport/SimpleQuery/SimpleQuery';
import DeliveredConfirmSearch from './DeliveredConfirmSearch';
import DeliveredBillCheck from './DeliveredBillCheck';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { SimpleSelect } from '@/pages/Component/RapidDevelopment/CommonComponent';

const { TabPane } = Tabs;
const { Content, Sider } = Layout;

@connect(({ quick, loading, deliveredConfirm }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
@Form.create()
export default class DeliveredConfirmPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      confirmQuickUuid: 'ITMS_SHIP_ORDER_STORE_CONFIRM',
      orderBillCheck:"sj_schedule_order_bill_check",
      selectFields: [],
      pageFilters: { matchType: '', queryParams: [] },
    };
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryColumns',
      payload: {
        reportCode: this.state.confirmQuickUuid,
        sysCode: 'tms',
      },
      callback: response => {
        this.setState({ selectFields: response.result.columns.filter(x => x.isSearch) });
      },
    });
  }

  render() {
    const { confirmQuickUuid, pageFilters, selectFields,orderBillCheck } = this.state;
    const { getFieldDecorator } = this.props.form;
    const isOrgQuery = [
      {
        field: 'companyuuid',
        type: 'VarChar',
        rule: 'eq',
        val: loginCompany().uuid,
      },
      {
        field: 'dispatchcenteruuid',
        type: 'VarChar',
        rule: 'eq',
        val: loginOrg().uuid,
      },
    ];
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          <Content style={{ height: 'calc(100vh - 120px)' }}>
            <SimpleQuery
              selectFields={selectFields}
              refresh={pageFilters => this.setState({ pageFilters })}
              reportCode={confirmQuickUuid}
              isOrgQuery={isOrgQuery}
            />
            <Tabs defaultActiveKey="store">
              <TabPane tab={'送货确认'} key="store">
                <DeliveredConfirmSearch
                  key="DeliveredConfirmSearch"
                  quickuuid={confirmQuickUuid}
                  pageFilters={pageFilters}
                />
              </TabPane>
              <TabPane tab={'票据核对'} key="bill">
                <DeliveredBillCheck
                  key="NoDeliveredConfirmSearch"
                  quickuuid={orderBillCheck}
                  pageFilters={pageFilters}
                />
              </TabPane>
            </Tabs>
          </Content>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
