/*
 * @Author: Liaorongchang
 * @Date: 2022-07-06 16:30:13
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-08-09 16:36:15
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CostBillSearchPage from './CostBillSearchPageC';
import CostBillEditView from '../CostCalculation/CostBillEditView';
import CostBillDtlSeacrhPage from './CostBillDtlSeacrhPage';
import { queryIdleAndThisPostionUseing } from '@/services/facility/Container';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CostBillViewForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'create') {
      const component = <CostBillSearchPage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'view') {
      const component = <CostBillEditView {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'query') {
      const component = <CostBillDtlSeacrhPage {...e.props} {...this.props} />;
      e.component = component;
    }
  };
}