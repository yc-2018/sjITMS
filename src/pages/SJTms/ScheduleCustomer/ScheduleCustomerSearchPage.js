/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-04-14 14:13:59
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { loginOrg } from '@/utils/LoginContext';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ScheduleReportSearchPage extends QuickFormSearchPage {
  defaultSearch = () => {
    const { pageFilters } = this.state;
    pageFilters.superQuery = '';
    //默认查询
    let ex = this.state.queryConfigColumns.filter(item => {
      return item.searchDefVal != null && item.searchDefVal != '';
    });
    let defaultSearch = [];
    let exSearchFilter;
    for (const item of ex) {
      if (item.fieldType == 'Date') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD');
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: `${startDate}||${endDate}`,
        };
      } else if (item.fieldType == 'DateTime') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD 23:59:59');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD 00:00:00');
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: `${startDate}||${endDate}`,
        };
      } else {
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: item.searchDefVal,
        };
      }
      defaultSearch.push(exSearchFilter);
    }
    //暂时通过这种方式赋予默认值
    defaultSearch.push({
      field: 'DISPATCHCENTERUUID',
      type: 'VARCHAR',
      rule: 'eq',
      val: loginOrg().uuid,
    });
    return defaultSearch;
  };

  //查询数据
  getData = pageFilters => {
    const { dispatch } = this.props;
    let queryFilter = { ...pageFilters };
    const deliverypointCode = queryFilter.superQuery.queryParams.find(
      x => x.field == 'DELIVERYPOINTCODE'
    );
    queryFilter.applySql = '';
    if (deliverypointCode) {
      queryFilter.applySql = ` uuid in (select billuuid from sj_itms_schedule_order where deliverypointcode='${
        deliverypointCode.val
      }')`;
      queryFilter.superQuery.queryParams = queryFilter.superQuery.queryParams.filter(
        x => x.field != 'DELIVERYPOINTCODE'
      );
    }
    dispatch({
      type: 'quick/queryData',
      payload: queryFilter,
      callback: response => {
        if (response.data) this.initData(response.data);
      },
    });
  };
}
