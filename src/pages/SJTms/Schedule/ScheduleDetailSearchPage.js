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

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class ScheduleDetailSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    isNotHd: true,
  };

  componentDidMount() {
    this.queryCoulumns();
    this.getCreateConfig();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedRows != this.props.selectedRows) {
      this.onSearch(nextProps.selectedRows);
    }
  }

  drawActionButton = () => {};

  drawToolbarPanel = () => {};

  drawSearchPanel = () => {};

  onSearch = data => {
    const { selectedRows } = this.props;
    let UUID = typeof data == 'undefined' ? selectedRows : data;
    const pageFilters = {
      ...this.state.pageFilters,
      superQuery: {
        matchType: '',
        queryParams: [
          {
            field: 'billuuid',
            type: 'VarChar',
            rule: 'eq',
            val: UUID,
          },
        ],
      },
    };
    this.state.pageFilters = pageFilters;
    this.refreshTable();
  };
}
