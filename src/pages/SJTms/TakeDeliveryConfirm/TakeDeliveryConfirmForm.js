/*
 * @Author: Liaorongchang
 * @Date: 2022-04-11 17:29:59
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-11 17:34:20
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import QuickFormSearchPage from './TakeDeliveryConfirmSearch';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class TakeDeliveryConfirmForm extends QuickForm {
  //继承QuickForm 重写drawTab方法 该方法用于重写跳转的界面
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <QuickFormSearchPage {...e.props} />;
      e.component = component;
    }
  };
}
