/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-03-07 14:24:52
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { havePermission } from '@/utils/authority';
import { Button } from 'antd';
import { getTableColumns } from '@/utils/LoginContext';
import ExportJsonExcel from 'js-export-excel';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ScheduleReportSearchPage extends QuickFormSearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: '',
      data: [],
      suspendLoading: false,
      columns: [],
      searchFields: [],
      advancedFields: [],
      reportCode: props.quickuuid,
      isOrgQuery: [],
      key: props.quickuuid + 'quick.search.customber', //用于缓存用户配置数据
      defaultSort: '',
      formConfig: {},
      colTotal: [],
      queryConfigColumns: [],
      tableName: '',
      authority: props.route?.authority ? props.route.authority[0] : null,
    };
  }

  //查询数据
  getData = pageFilters => {
    const { dispatch } = this.props;
    const deliverypointCode = pageFilters.superQuery.queryParams.find(
      x => x.field == 'DELIVERYPOINTCODE'
    );
    pageFilters.applySql = '';
    if (deliverypointCode) {
      pageFilters.applySql = ` uuid in (select billuuid from sj_itms_schedule_order where deliverypointcode='${
        deliverypointCode.val
      }')`;
      pageFilters.superQuery.queryParams = pageFilters.superQuery.queryParams.filter(
        x => x.field != 'DELIVERYPOINTCODE'
      );
    }
    dispatch({
      type: 'quick/queryData',
      payload: pageFilters,
      callback: response => {
        if (response.data) this.initData(response.data);
      },
    });
  };

  

 
}
