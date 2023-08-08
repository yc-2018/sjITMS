/*
 * @Author: Liaorongchang
 * @Date: 2022-07-06 16:30:13
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-08-10 11:56:18
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CostBillBakSearchPage from './CostBillBakSearchPage';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CostBillBakForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <CostBillBakSearchPage {...e.props} />;
      e.component = component;
    }
  };
}
