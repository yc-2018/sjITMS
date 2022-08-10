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
import CostBillSearchPage from './CostBillSearchPage';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CostBillForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <CostBillSearchPage {...e.props} />;
      e.component = component;
    }
  };
}
