/*
 * @Author: Liaorongchang
 * @Date: 2022-04-01 11:30:00
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-01 16:12:15
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
    isNotHd: true,
    scroll: {
      x: 4000,
      y: 'calc(50vh)',
    },
  };

  componentDidMount = () => {
    this.queryCoulumns();
    this.props.onRef(this);
  };

  drawActionButton = () => {};

  drawToolbarPanel = () => {};

  drawSearchPanel = () => {};

  onSearch = () => {
    console.log('这里会跑？');
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
            field: 'uuid',
            type: 'VarChar',
            rule: 'eq',
            val: selectedRows,
            // val: 'cc3364d4bb394efc82b1b446dfa24fe9',
          },
        ],
      },
    };
    this.state.pageFilters = pageFilters;
    this.refreshTable();
  };
}
