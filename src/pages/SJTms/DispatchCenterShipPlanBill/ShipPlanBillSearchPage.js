/*
 * @Author: Liaorongchang
 * @Date: 2022-03-19 17:18:03
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-25 18:28:50
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Tabs, Layout, Empty, Modal } from 'antd';
import { connect } from 'dva';
import SimpleQuery from '@/pages/Component/RapidDevelopment/OnlReport/SimpleQuery/SimpleQuery';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import styles from './DispatchCenterShipPlanBill.less';
import ShipPlanBillSearch from './ShipPlanBillSearch';
import ShipPlanBillDtlSearch from './ShipPlanBillDtlSearch';
import emptySvg from '@/assets/common/img_empoty.svg';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import ShipPlanBillCreatePage from './ShipPlanBillCreatePage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import RemoveCarCreatePage from './RemoveCarCreatePage';
import { log } from 'lodash-decorators/utils';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';

const { Content } = Layout;
const TabPane = Tabs.TabPane;
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ShipPlanBillSearchPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      title: 'test',
      data: [],
      keyValue: '1',
      keyDtlVale: 'a',
      tabTrue: false,
      suspendLoading: false,
      columns: [],
      selectedRows: [],
      searchFields: [],
      advancedFields: [],
      reportCode: props.quickuuid,
      pageFilters: { quickuuid: props.quickuuid, changePage: true },
      isOrgQuery: [],
      key: props.quickuuid + 'quick.search.table',
      showCreatePage: false,
      params: [],
    }; //用于缓存用户配置数据
  }

  componentDidMount() {
    this.queryCoulumns();
  }

  //获取列配置
  queryCoulumns = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryColumns',
      payload: {
        reportCode: this.state.reportCode,
        sysCode: 'tms',
      },
      callback: response => {
        if (response.result) {
          this.initConfig(response.result);

          let companyuuid = response.result.columns.find(
            item => item.fieldName.toLowerCase() == 'companyuuid'
          );

          let orgName =
            loginOrg().type.toLowerCase() == 'dc'
              ? loginOrg().type.toLowerCase() + 'Uuid'
              : 'dispatchcenteruuid';
          let org = response.result.columns.find(item => item.fieldName.toLowerCase() == orgName);

          if (companyuuid) {
            this.state.isOrgQuery = [
              {
                field: 'companyuuid',
                type: 'VarChar',
                rule: 'eq',
                val: loginCompany().uuid,
              },
            ];
          }

          if (org) {
            this.setState({
              isOrgQuery: response.result.reportHead.organizationQuery
                ? [
                    {
                      field:
                        loginOrg().type.toLowerCase() == 'dc'
                          ? loginOrg().type.toLowerCase() + 'Uuid'
                          : 'dispatchCenterUuid',
                      type: 'VarChar',
                      rule: 'eq',
                      val: loginOrg().uuid,
                    },
                    ...this.state.isOrgQuery,
                  ]
                : [...this.state.isOrgQuery],
            });
          }
        }
      },
    });
  };

  //初始化配置
  initConfig = queryConfig => {
    const columns = queryConfig.columns;
    this.setState({
      advancedFields: columns.filter(data => data.isShow),
      searchFields: columns.filter(data => data.isSearch),
    });
  };

  /**
   * 查询
   */
  onSearch = filter => {
    if (typeof filter == 'undefined' || filter == 'reset') {
      this.setState({ selectedRows: [], showCreatePage: false });
      const pageFilters = {
        ...this.state.pageFilters,
        page: 0,
        pageSize: 20,
        sortFields: {},
        searchKeyValues: {},
        likeKeyValues: {},
        superQuery: {
          matchType: filter.matchType,
          queryParams: [...this.state.isOrgQuery],
        },
      };
      this.state.pageFilters = pageFilters;
      this.queryCoulumns();
    } else {
      const pageFilters = {
        ...this.state.pageFilters,
        page: 0,
        pageSize: 20,
        sortFields: {},
        searchKeyValues: {},
        likeKeyValues: {},
        superQuery: {
          matchType: filter.matchType,
          queryParams: [...filter.queryParams, ...this.state.isOrgQuery],
        },
      };
      this.state.pageFilters = pageFilters;
      this.queryCoulumns();
    }
  };

  callback = key => {
    this.setState({
      keyValue: key,
      tabTrue: true,
    });
  };

  changeTabs = key => {
    this.setState({
      keyDtlVale: key,
    });
  };

  refreshView = (record, selectedRows) => {
    if (!record && selectedRows && selectedRows.length > 0) {
      this.setState({
        showCreatePage: true,
        selectedRows: selectedRows[selectedRows.length - 1],
        // viewData: null,
      });
    } else if (record && !selectedRows) {
      this.setState({
        showCreatePage: true,
        // viewData: record,
        selectedRows: [],
      });
    } else {
      this.setState({
        showCreatePage: false,
      });
    }
  };

  memberModalClick = record => {
    this.setState({
      params: { entityUuid: record.UUID, title: record.BILLNUMBER },
    });
    this.createPageModalRef.show();
  };

  removeCarModalClick = selectedRows => {
    this.setState({
      params: { entityUuid: selectedRows[0].UUID, title: selectedRows[0].BILLNUMBER },
    });
    this.RemoveCarModalRef.show();
  };

  render() {
    const {
      reportCode,
      pageFilters,
      keyValue,
      keyDtlVale,
      tabTrue,
      showCreatePage,
      selectedRows,
      params,
      isOrgQuery,
    } = this.state;
    return (
      <PageHeaderWrapper>
        <Page>
          <Content className={styles.contentWrapper}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ flex: 1 }} className={styles.leftWrapper}>
                <SimpleQuery
                  selectFields={this.state.searchFields}
                  refresh={this.onSearch}
                  reportCode={this.state.reportCode}
                  isOrgQuery={this.state.isOrgQuery}
                />
                <div>
                  <ShipPlanBillSearch
                    reportCode={reportCode}
                    pageFilter={pageFilters}
                    isOrgQuery={isOrgQuery}
                    refreshView={this.refreshView}
                    memberModalClick={this.memberModalClick}
                    removeCarModalClick={this.removeCarModalClick}
                    onRef={node => (this.refreshTableRef = node)}
                  />
                </div>
                <div style={{ height: '700px' }}>
                  {!showCreatePage ? (
                    <Empty image={emptySvg} description={<span>暂无数据,请先选择排车单</span>} />
                  ) : (
                    <Tabs activeKey={keyDtlVale} onChange={this.changeTabs}>
                      <TabPane tab="排车单明细" key={'a'}>
                        <ShipPlanBillDtlSearch
                          quickuuid={'sj_itms_schedule_order'}
                          selectedRows={selectedRows.UUID}
                        />
                      </TabPane>
                      <TabPane tab="操作日志" key={'b'}>
                        <EntityLogTab entityUuid={selectedRows.UUID} />
                      </TabPane>
                    </Tabs>
                  )}
                </div>
              </div>
            </div>
          </Content>
        </Page>

        <CreatePageModal
          modal={{ title: params.title, width: 1000 }}
          page={{ quickuuid: 'sj_itms_schedule', params: params }}
          customPage={ShipPlanBillCreatePage}
          onRef={node => (this.createPageModalRef = node)}
        />
        <CreatePageModal
          modal={{
            title: params.title,
            width: 1000,
            afterClose: () => {
              this.refreshTableRef.queryCoulumns();
            },
          }}
          page={{ quickuuid: 'sj_itms_schedule_removecar', params: params }}
          customPage={RemoveCarCreatePage}
          onRef={node => (this.RemoveCarModalRef = node)}
        />
      </PageHeaderWrapper>
    );
  }
}
