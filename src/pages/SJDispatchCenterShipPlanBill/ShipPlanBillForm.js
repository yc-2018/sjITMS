/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 10:48:58
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-03-25 10:22:41
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import ShipPlanBillSearchPage from './ShipPlanBillSearchPage';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ShipPlanBillForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <ShipPlanBillSearchPage {...e.props} />;
      e.component = component;
    }
  };
}
