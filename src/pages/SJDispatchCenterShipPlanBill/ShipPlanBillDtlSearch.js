/*
 * @Author: Liaorongchang
 * @Date: 2022-03-22 15:06:02
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-03-24 09:18:18
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class ShipPlanBillDtlSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    scroll: {
      x: 4000,
      y: 'calc(50vh)',
    },
  };

  drawActionButton = () => {};

  drawToolbarPanel = () => {};

  drawSearchPanel = () => {};

  onSearch = () => {
    const { selectedRows } = this.props;
    const pageFilters = {
      ...this.state.pageFilters,
      superQuery: {
        matchType: '',
        queryParams: [
          {
            field: 'billuuid',
            type: 'VarChar',
            rule: 'eq',
            val: selectedRows[0].UUID,
          },
        ],
      },
    };
    this.state.pageFilters = pageFilters;
    this.refreshTable();
  };
}
