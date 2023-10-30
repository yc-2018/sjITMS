/*
 * @Author: Liaorongchang
 * @Date: 2022-07-06 16:30:13
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-10-30 17:51:10
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CostBillDtlSeacrhPage from './CostBillDtlSeacrhPage';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CostBillViewForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <CostBillDtlSeacrhPage {...e.props} {...this.props} />;
      e.component = component;
    }
  };
}
