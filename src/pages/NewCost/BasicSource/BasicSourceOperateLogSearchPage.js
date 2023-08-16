import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class BasicSourceOperateLogSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    isNotHd: true,
    createModal: false,
  };

  drawActionButton = () => {};
  drawToolbarPanel = () => {};

  exSearchFilter = () => {
    return [
      {
        field: 'SOURCEUUID',
        type: 'VarChar',
        rule: 'eq',
        val: this.props.selectedRows,
      },
    ];
  };

  //查询
  onSearch = async (filter, isNotFirstSearch) => {
    let exSearchFilter = this.exSearchFilter();
    if (!exSearchFilter) exSearchFilter = [];
    let defaultSearch = await this.defaultSearch();
    if (!defaultSearch) defaultSearch = [];
    const { quickuuid } = this.props;
    //增加查询页数从缓存中读取
    let pageSize = Number(localStorage.getItem(quickuuid + 'searchPageLine')) || 20;

    //点击重置
    if (filter == 'reset') {
      this.onReset(pageSize, [...exSearchFilter, ...defaultSearch]);
      return;
    }
    const { pageFilters, isOrgQuery, defaultSort, superParams, linkQuery } = this.state;
    let simpleParams = [...exSearchFilter];
    console.log('pageFilters', pageFilters);
    if (filter?.queryParams) {
      //点击查询
      simpleParams = simpleParams.concat(filter.queryParams);
    } else {
      if (!pageFilters.superQuery) {
        //首次加载
        simpleParams = simpleParams.concat(defaultSearch);
      }
    }
    let queryParams = [...simpleParams];
    queryParams = queryParams.filter(item => {
      return (
        item.field != 'dispatchCenterUuid' && item.field != 'dcUuid' && item.field != 'companyuuid'
      );
    });
    const params = linkQuery == 1 && superParams ? superParams : [];
    const newPageFilters = {
      pageSize,
      page: 1,
      quickuuid,
      order: this.state.pageFilters?.order ? this.state.pageFilters?.order : defaultSort,
      superQuery: {
        matchType: 'and',
        queryParams: [...isOrgQuery, ...queryParams, ...params],
      },
    };
    this.setState({ pageFilters: newPageFilters, simpleParams });
    if (!(filter == 'first' && isNotFirstSearch)) this.getData(newPageFilters);
  };
}
