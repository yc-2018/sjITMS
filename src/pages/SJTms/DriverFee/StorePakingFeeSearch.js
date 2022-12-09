/*
 * @Author: Liaorongchang
 * @Date: 2022-04-18 11:18:56
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-12-09 10:08:32
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class StorePakingFeeSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = { ...this.state, isNotHd: true };

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {};

  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {};

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel = () => {};

  onSearch = () => {
    const { record } = this.props;
    const pageFilters = {
      ...this.state.pageFilters,
      superQuery: {
        matchType: '',
        queryParams: [
          {
            field: 'UUID',
            type: 'VarChar',
            rule: 'eq',
            val: record,
          },
        ],
      },
    };
    this.state.pageFilters = pageFilters;
    this.refreshTable();
  };
}
