/*
 * @Author: guankongjin
 * @Date: 2022-06-29 16:26:59
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-08-09 16:38:08
 * @Description: 排车单明细列表
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\ScheduleDeliverySearchPage.js
 */
import { connect } from 'dva';
import { Button } from 'antd';
import { havePermission } from '@/utils/authority';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class ScheduleDeliveryPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    isNotHd: true,
    noNavigator: true,
    key: 'ScheduleDeliveryPage',
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

  drawToolbarPanel = () => {
    return (
      <Button
        onClick={this.port}
        hidden={!havePermission(this.props.authority + '.port')}
        type="primary"
      >
        导出
      </Button>
    );
  };

  drawSearchPanel = () => {};

  onSearch = data => {
    const { selectedRows } = this.props;
    let UUID = typeof data == 'undefined' || data == 'first' ? selectedRows : data;
    const pageFilters = {
      ...this.state.pageFilters,
      order: this.state.defaultSort,
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
