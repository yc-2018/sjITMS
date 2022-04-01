/*
 * @Author: Liaorongchang
 * @Date: 2022-04-01 11:30:00
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-01 14:11:24
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
export default class ChargeLoadingDtlSearchPage extends QuickFormSearchPage {
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
    if (!selectedRows) {
      return;
    }
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
