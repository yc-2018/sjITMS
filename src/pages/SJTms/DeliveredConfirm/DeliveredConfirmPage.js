import React, { Component, PureComponent } from 'react';
import { Form, message, Tabs, Layout, Row, Col, Button } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import SimpleQuery from '@/pages/Component/RapidDevelopment/OnlReport/SimpleQuery/SimpleQuery';
import DeliveredConfirmSearch from './DeliveredConfirmSearch';
import DeliveredBillCheck from './DeliveredBillCheck';
import { connect } from 'dva';
import { loginCompany, loginOrg, getActiveKey, setPageFilter } from '@/utils/LoginContext';
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
      orderBillCheck: 'sj_schedule_order_bill_check',
      selectFields: [],
      pageFilters: {
        matchType: '',
        queryParams: [
          {
            field: 'STAT',
            type: 'VarChar',
            rule: 'eq',
            val: 'ForConfirm',
          },
        ],
      },
      authority: props.route?.authority ? props.route.authority[0] : null,
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
  onSearch = pageFilters => {
    this.setState({ pageFilters });
  };
  render() {
    const { confirmQuickUuid, pageFilters, selectFields, orderBillCheck } = this.state;
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
    let params = {};
    selectFields
      ?.filter(item => {
        return item.searchDefVal != undefined;
      })
      ?.forEach(e => {
        params[e['fieldName']] = e['searchDefVal'];
      });
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          <Content style={{ height: 'calc(100vh - 120px)' }}>
            <SimpleQuery
              filterValue={params}
              selectFields={selectFields}
              refresh={pageFilter => this.onSearch(pageFilter)}
              reportCode={confirmQuickUuid}
              isOrgQuery={isOrgQuery}
            />
            <Tabs defaultActiveKey="store">
              <TabPane tab={'送货确认'} key="store">
                <DeliveredConfirmSearch
                  key="DeliveredConfirmSearch"
                  quickuuid={confirmQuickUuid}
                  pageFilters={pageFilters}
                  authority={this.state.authority}
                />
              </TabPane>
              <TabPane tab={'票据核对'} key="bill">
                <DeliveredBillCheck
                  key="NoDeliveredConfirmSearch"
                  quickuuid={orderBillCheck}
                  pageFilters={pageFilters}
                  authority={this.state.authority}
                />
              </TabPane>
            </Tabs>
          </Content>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
