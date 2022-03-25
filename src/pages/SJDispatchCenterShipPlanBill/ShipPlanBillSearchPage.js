/*
 * @Author: Liaorongchang
 * @Date: 2022-03-19 17:18:03
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-03-25 16:49:08
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
      tabTrue: false,
      suspendLoading: false,
      columns: [],
      selectedRows: [],
      searchFields: [],
      advancedFields: [],
      reportCode: props.quickuuid,
      updateMemberModalVisible: false,
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

          console.log('companyuuid', companyuuid);

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
    if (typeof filter == 'undefined') {
      this.queryCoulumns();
    } else {
      this.setState({ keyValue: '2' });
      const { dispatch } = this.props;
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
    }
  };

  callback = key => {
    this.setState({
      keyValue: key,
      tabTrue: true,
    });
  };

  refreshView = (record, selectedRows) => {
    console.log('record', record, 'selectedRows', selectedRows);
    if (!record && selectedRows && selectedRows.length > 0) {
      this.setState({
        showCreatePage: true,
        selectedRows: selectedRows,
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
    console.log('record', record.UUID);
    this.setState({
      updateMemberModalVisible: true,
      params: { entityUuid: record.UUID, title: record.BILLNUMBER },
    });
  };

  okHandleMember = () => {
    this.setState({ updateMemberModalVisible: false });
  };

  render() {
    const {
      reportCode,
      pageFilters,
      keyValue,
      tabTrue,
      showCreatePage,
      selectedRows,
      updateMemberModalVisible,
      params,
    } = this.state;
    return (
      <PageHeaderWrapper>
        <Page>
          <Content className={styles.contentWrapper}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ flex: 1 }} className={styles.leftWrapper}>
                <Tabs defaultActiveKey="1" onChange={this.callback} activeKey={keyValue}>
                  <TabPane tab="查询条件" key={'1'}>
                    <SimpleQuery
                      selectFields={this.state.searchFields}
                      // filterValue={this.state.pageFilter.filterValue}
                      refresh={this.onSearch}
                      reportCode={this.state.reportCode}
                      isOrgQuery={this.state.isOrgQuery}
                    />
                  </TabPane>
                  <TabPane tab="结果" key={'2'}>
                    <div>
                      <ShipPlanBillSearch
                        reportCode={reportCode}
                        pageFilter={pageFilters}
                        tabTrue={tabTrue}
                        refreshView={this.refreshView}
                        memberModalClick={this.memberModalClick}
                      />
                    </div>
                    <div style={{ margin: '24px -8px 0px', height: '700px' }}>
                      {!showCreatePage ? (
                        <Empty
                          image={emptySvg}
                          description={<span>暂无数据,请先选择排车单</span>}
                        />
                      ) : (
                        <ShipPlanBillDtlSearch
                          quickuuid={'v_sj_itms_schedule_order'}
                          selectedRows={selectedRows}
                        />
                      )}
                    </div>
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </Content>
        </Page>
        <Modal
          title={params.title}
          width={800}
          height={500}
          visible={updateMemberModalVisible}
          onOk={this.okHandleMember}
          confirmLoading={false}
          onCancel={() => this.setState({ updateMemberModalVisible: false })}
        >
          {/* <a>测试</a> */}
          <ShipPlanBillCreatePage
            quickuuid="sj_itms_schedule"
            params={params}
            noBorder={true}
            noCategory={true}
          />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}
