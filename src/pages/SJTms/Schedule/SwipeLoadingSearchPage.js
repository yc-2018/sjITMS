/*
 * @Author: guankongjin
 * @Date: 2022-06-29 16:26:59
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-29 16:32:56
 * @Description: 排车单明细列表
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\ScheduleDetailSearchPage.js
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
    // tableHeight: 'calc(40vh - 300px)',
    scroll: { y: 'calc(30vh)' },//calc(70vh - 100px)
    noPagination: true,
    pathname: '/tmsexec/checkinLoading'
  };

  componentDidMount() {
    this.queryCoulumns();
    this.getCreateConfig();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.time != this.props.time) {
      this.onSearch(nextProps.selectedRows);
    }
  }

  drawActionButton = () => { };

  drawToolbarPanel = () => { };

  drawSearchPanel = () => { };

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

          { field: "companyuuid", type: "VarChar", rule: "eq", val: loginCompany().uuid },
          { field: "dispatchCenterUuid", type: "VarChar", rule: "eq", val: loginOrg().uuid }
        ],
      },
    }
    if (WAVENUM == '' || WAVENUM == undefined) {
      pageFilters.superQuery = {
        queryParams: [
          { field: "companyuuid", type: "VarChar", rule: "eq", val: loginCompany().uuid },
          { field: "dispatchCenterUuid", type: "VarChar", rule: "eq", val: loginOrg().uuid }
        ]
      }
    }
    pageFilters.pageSize = 300;
    this.state.pageFilters = pageFilters;
    this.refreshTable();
  };
}
