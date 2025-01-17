/*
 * @Author: guankongjin
 * @Date: 2022-06-29 16:26:59
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-02-15 17:17:14
 * @Description: 装车刷卡
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\SwipeLoadingSearchPage.js
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class SwipeLoadingSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    isNotHd: true,
    noNavigator: true,
    noSettingColumns: true,
    hasSettingColumns: false,
    scroll: { y: `calc(100vh - 400px)` },
    noPagination: true,
    unShowRow: true,
    pathname: '/tmsexec/checkinLoading',
  };

  componentDidMount() {
    this.queryCoulumns();
  }

  //获取列配置
  queryCoulumns = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryColumnsByOpen',
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
            loginOrg().type?.toLowerCase() == 'dc'
              ? loginOrg().type?.toLowerCase() + 'Uuid'
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
                        loginOrg().type?.toLowerCase() == 'dc'
                          ? loginOrg().type?.toLowerCase() + 'Uuid'
                          : 'dispatchCenterUuid',
                      type: 'VarChar',
                      rule: 'like',
                      val: loginOrg().uuid,
                    },
                    ...this.state.isOrgQuery,
                  ]
                : [...this.state.isOrgQuery],
            });
          }

          let defaultSortColumn = response.result.columns.find(item => item.orderType > 1);
          if (defaultSortColumn) {
            let defaultSort =
              defaultSortColumn.orderType == 2
                ? defaultSortColumn.fieldName + ',ascend'
                : defaultSortColumn.fieldName + ',descend';
            this.setState({ defaultSort });
          }

          //配置查询成功后再去查询数据
          this.onSearch();
          //扩展State
          this.changeState();
        }
      },
    });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.time != this.props.time || nextProps.dispatchUuid != this.props.dispatchUuid) {
      const { dispatchUuid, companyUuid, selectedRows } = nextProps;
      this.state.dispatchUuid = dispatchUuid;
      this.state.companyUuid = companyUuid;
      this.onSearch(selectedRows);
    }
  }

  drawActionButton = () => {};
  drawToolbarPanel = () => {};
  drawSearchPanel = () => {};

  onSearch = data => {
    const { selectedRows } = this.props;
    let WAVENUM = typeof data == 'undefined' ? selectedRows : data;
    const pageFilters = {
      ...this.state.pageFilters,
      superQuery: {
        matchType: '',
        queryParams: [
          {
            field: 'WAVENUM',
            type: 'VarChar',
            rule: 'like',
            val: WAVENUM,
          },

          { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
          { field: 'dispatchCenterUuid', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
        ],
      },
    };
    if (WAVENUM == '' || WAVENUM == undefined) {
      pageFilters.superQuery = {
        queryParams: [
          { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
          { field: 'dispatchCenterUuid', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
        ],
      };
    }
    pageFilters.pageSize = 300;
    this.state.pageFilters = pageFilters;
    this.refreshTable();
  };

  refreshTable = filter => {
    const { pageFilters } = this.state;
    let queryFilter = { ...pageFilters };
    if (filter) {
      var order = '';
      for (var key in filter.sortFields) {
        var sort = filter.sortFields[key] ? 'descend' : 'ascend';
        order = key + ',' + sort;
      }
      queryFilter = {
        ...pageFilters,
        order: order,
        page: 1,
        pageSize: 300,
      };
      //设置页码缓存
      localStorage.setItem(this.state.reportCode + 'searchPageLine', filter.pageSize);
    } else {
      //查询页码重置为1
      queryFilter.page = 1;
    }
    queryFilter.superQuery = {
      queryParams: [
        { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: this.state.companyUuid },
        { field: 'dispatchCenterUuid', type: 'VarChar', rule: 'eq', val: this.state.dispatchUuid },
      ],
    };
    this.state.pageFilters = queryFilter;
    this.getData(queryFilter);
  };
  //查询数据
  getData = pageFilters => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryDataByOpen',
      payload: pageFilters,
      callback: response => {
        if (response.data) this.initData(response.data);
      },
    });
  };
}
