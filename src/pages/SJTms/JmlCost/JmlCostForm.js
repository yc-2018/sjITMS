/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 10:48:58
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-24 09:21:25
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';

import QuickFormSearchPage from './JmlCostOrderSearch';

import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class TranOrderForm extends QuickForm {
  onCancel = () => {
    this.switchTab('query');
  };

  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <QuickFormSearchPage {...e.props} />;
      e.component = component;
    }else if (e.showPageNow == 'view') {
      const component = <OrderView {...e.props} />;
      e.component = component;
    } 
  }
}

